package com.alovecino.authservice;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.emptyOrNullString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;

import jakarta.servlet.http.Cookie;
import jakarta.persistence.EntityManager;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.alovecino.authservice.model.Rol;
import com.alovecino.authservice.model.RefreshToken;
import com.alovecino.authservice.model.SesionUsuario;
import com.alovecino.authservice.model.Usuario;
import com.alovecino.authservice.repository.RefreshTokenRepository;
import com.alovecino.authservice.service.RefreshTokenService;
import com.nimbusds.jwt.SignedJWT;

@SpringBootTest
@AutoConfigureMockMvc
class AuthServiceApplicationTests {

    private static final String TEST_EMAIL = "test@alovecino.com";
    private static final String TEST_PASSWORD = "test1234";

    private final MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;
    private final TransactionTemplate transactionTemplate;
    private final RefreshTokenService refreshTokenService;
    private final RefreshTokenRepository refreshTokenRepository;
    private Cookie currentRefreshTokenCookie;

    @Autowired
    AuthServiceApplicationTests(MockMvc mockMvc, PasswordEncoder passwordEncoder,
            EntityManager entityManager, PlatformTransactionManager transactionManager,
            RefreshTokenService refreshTokenService, RefreshTokenRepository refreshTokenRepository) {
        this.mockMvc = mockMvc;
        this.passwordEncoder = passwordEncoder;
        this.entityManager = entityManager;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
        this.refreshTokenService = refreshTokenService;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @BeforeEach
    void setUp() {
        transactionTemplate.executeWithoutResult(status -> {
            deleteTestUserData();

            Rol rol = entityManager
                    .createQuery("select r from Rol r where r.nombreRol = :nombreRol", Rol.class)
                    .setParameter("nombreRol", "USER")
                    .getResultStream()
                    .findFirst()
                    .orElseGet(() -> {
                        Rol newRol = new Rol();
                        newRol.setNombreRol("USER");
                        entityManager.persist(newRol);
                        return newRol;
                    });

            Usuario usuario = new Usuario();
            usuario.setNombreUsuario(TEST_EMAIL);
            usuario.setCorreo(TEST_EMAIL);
            usuario.setNombre("Usuario Test");
            usuario.setContrasena(passwordEncoder.encode(TEST_PASSWORD));
            usuario.setRol(rol);
            entityManager.persist(usuario);
            entityManager.flush();
        });
    }

    @AfterEach
    void tearDown() {
        transactionTemplate.executeWithoutResult(status -> deleteTestUserData());
    }

    private void deleteTestUserData() {
        entityManager.createQuery("delete from RefreshToken rt where rt.sesionUsuario.usuario.correo = :email")
                .setParameter("email", TEST_EMAIL)
                .executeUpdate();
        entityManager.createQuery("delete from SesionUsuario su where su.usuario.correo = :email")
                .setParameter("email", TEST_EMAIL)
                .executeUpdate();
        entityManager.createQuery("delete from Usuario u where u.correo = :email")
                .setParameter("email", TEST_EMAIL)
                .executeUpdate();
    }

    @Test
    void loginReturnsAccessTokenAndRefreshTokenForSeededUser() throws Exception {
        String request = """
                {
                    "email": "%s",
                    "password": "%s"
                }
                """.formatted(TEST_EMAIL, TEST_PASSWORD);

        MvcResult result = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(request))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").doesNotExist())
                .andExpect(jsonPath("$.accessToken", not(emptyOrNullString())))
                .andExpect(jsonPath("$.refreshToken", not(emptyOrNullString())))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value(TEST_EMAIL))
                .andExpect(jsonPath("$.user.name").value("Usuario Test"))
                .andReturn();

        JsonNode response = objectMapper.readTree(result.getResponse().getContentAsString());
        String accessToken = response.get("accessToken").asText();
        Cookie refreshTokenCookie = result.getResponse().getCookie("refreshToken");
        SignedJWT jwt = SignedJWT.parse(accessToken);

        assertThat(accessToken.split("\\.")).hasSize(3);
        assertThat(jwt.getHeader().getAlgorithm().getName()).isEqualTo("RS256");
        assertThat(jwt.getJWTClaimsSet().getSubject()).isNotBlank();
        assertThat(jwt.getJWTClaimsSet().getStringClaim("sid")).isNotBlank();
        assertThat(jwt.getJWTClaimsSet().getStringClaim("session_id"))
                .isEqualTo(jwt.getJWTClaimsSet().getStringClaim("sid"));
        assertThat(jwt.getJWTClaimsSet().getStringClaim("email")).isEqualTo(TEST_EMAIL);
        assertThat(jwt.getJWTClaimsSet().getStringListClaim("roles")).containsExactly("ROLE_USER");
        assertThat(refreshTokenCookie).isNotNull();
        assertThat(refreshTokenCookie.getValue()).isNotBlank();
        assertThat(refreshTokenCookie.isHttpOnly()).isTrue();
        assertThat(result.getResponse().getHeader("Set-Cookie")).contains("SameSite=Lax");

        List<SesionUsuario> sesiones = findTestSessions();
        assertThat(sesiones).hasSize(1);
        assertThat(sesiones.get(0).getRevokedAt()).isNull();

        RefreshToken persistedRefreshToken = refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(
                refreshTokenService.hash(refreshTokenCookie.getValue())).orElseThrow();
        assertThat(persistedRefreshToken.getTokenHash()).isNotEqualTo(refreshTokenCookie.getValue());
        assertThat(persistedRefreshToken.getTokenHash()).hasSize(64);
        assertThat(persistedRefreshToken.getSesionUsuario().getIdSesionUsuario())
                .isEqualTo(sesiones.get(0).getIdSesionUsuario());
        assertThat(persistedRefreshToken.getExpiresAt()).isAfter(persistedRefreshToken.getCreatedAt());
        assertThat(persistedRefreshToken.getTokenHash()).isNotEqualTo(accessToken);
    }

    @Test
    void loginReturnsUnauthorizedForInvalidPassword() throws Exception {
        String request = """
                {
                    "email": "%s",
                    "password": "wrong-password"
                }
                """.formatted(TEST_EMAIL);

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(request))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Credenciales inválidas"));
    }

    @Test
    void refreshRotatesRefreshTokenAndRejectsOldToken() throws Exception {
        JsonNode loginResponse = login(TEST_EMAIL, TEST_PASSWORD);
        String oldRefreshToken = currentRefreshTokenCookie.getValue();
        RefreshToken oldPersistedToken = refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(
                refreshTokenService.hash(oldRefreshToken)).orElseThrow();
        Long sessionId = oldPersistedToken.getSesionUsuario().getIdSesionUsuario();

        MvcResult refreshResult = mockMvc.perform(post("/auth/refresh")
                .cookie(currentRefreshTokenCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", not(emptyOrNullString())))
                .andExpect(jsonPath("$.refreshToken", not(emptyOrNullString())))
                .andExpect(jsonPath("$.token").doesNotExist())
                .andReturn();

        Cookie newRefreshTokenCookie = refreshResult.getResponse().getCookie("refreshToken");
        String newRefreshToken = newRefreshTokenCookie.getValue();

        assertThat(newRefreshTokenCookie).isNotNull();
        assertThat(newRefreshTokenCookie.isHttpOnly()).isTrue();
        assertThat(newRefreshToken).isNotEqualTo(oldRefreshToken);
        assertThat(refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(
                refreshTokenService.hash(oldRefreshToken))).isEmpty();
        RefreshToken newPersistedToken = refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(
                refreshTokenService.hash(newRefreshToken)).orElseThrow();
        assertThat(newPersistedToken.getSesionUsuario().getIdSesionUsuario()).isEqualTo(sessionId);
        assertThat(findTestSessions()).hasSize(1);

        mockMvc.perform(post("/auth/refresh")
                .cookie(currentRefreshTokenCookie))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Refresh token inválido"));
    }

    @Test
    void refreshAcceptsRefreshTokenFromRequestBodyForMobileClients() throws Exception {
        JsonNode loginResponse = login(TEST_EMAIL, TEST_PASSWORD);
        String oldRefreshToken = loginResponse.get("refreshToken").asText();
        RefreshToken oldPersistedToken = refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(
                refreshTokenService.hash(oldRefreshToken)).orElseThrow();
        Long sessionId = oldPersistedToken.getSesionUsuario().getIdSesionUsuario();

        MvcResult refreshResult = mockMvc.perform(post("/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "refreshToken": "%s"
                        }
                        """.formatted(oldRefreshToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", not(emptyOrNullString())))
                .andExpect(jsonPath("$.refreshToken", not(emptyOrNullString())))
                .andReturn();

        JsonNode refreshResponse = objectMapper.readTree(refreshResult.getResponse().getContentAsString());
        String newRefreshToken = refreshResponse.get("refreshToken").asText();

        assertThat(newRefreshToken).isNotEqualTo(oldRefreshToken);
        assertThat(refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(
                refreshTokenService.hash(oldRefreshToken))).isEmpty();
        RefreshToken newPersistedToken = refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(
                refreshTokenService.hash(newRefreshToken)).orElseThrow();
        assertThat(newPersistedToken.getSesionUsuario().getIdSesionUsuario()).isEqualTo(sessionId);
    }

    @Test
    void refreshReturnsUnauthorizedForExpiredRefreshToken() throws Exception {
        JsonNode loginResponse = login(TEST_EMAIL, TEST_PASSWORD);
        String refreshToken = currentRefreshTokenCookie.getValue();
        String refreshTokenHash = refreshTokenService.hash(refreshToken);

        transactionTemplate.executeWithoutResult(status -> refreshTokenRepository
                .findByTokenHashAndRevokedAtIsNull(refreshTokenHash)
                .ifPresent(token -> {
                    token.setCreatedAt(Instant.now().minusSeconds(120));
                    token.setExpiresAt(Instant.now().minusSeconds(60));
                }));

        mockMvc.perform(post("/auth/refresh")
                .cookie(currentRefreshTokenCookie))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Refresh token inválido"));

        assertThat(refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(refreshTokenHash)).isEmpty();
        assertThat(findTestSessions()).hasSize(1);
        assertThat(findTestSessions().get(0).getRevokedAt()).isNull();
    }

    @Test
    void logoutRevokesRefreshToken() throws Exception {
        JsonNode loginResponse = login(TEST_EMAIL, TEST_PASSWORD);
        String refreshToken = currentRefreshTokenCookie.getValue();
        String refreshTokenHash = refreshTokenService.hash(refreshToken);

        mockMvc.perform(post("/auth/logout")
                .cookie(currentRefreshTokenCookie))
                .andExpect(status().isNoContent())
                .andExpect(header().string("Set-Cookie", org.hamcrest.Matchers.containsString("Max-Age=0")));

        assertThat(refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(refreshTokenHash)).isEmpty();
        assertThat(findTestSessions()).hasSize(1);
        assertThat(findTestSessions().get(0).getRevokedAt()).isNotNull();

        mockMvc.perform(post("/auth/refresh")
                .cookie(currentRefreshTokenCookie))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logoutAcceptsRefreshTokenFromRequestBodyForMobileClients() throws Exception {
        JsonNode loginResponse = login(TEST_EMAIL, TEST_PASSWORD);
        String refreshToken = loginResponse.get("refreshToken").asText();
        String refreshTokenHash = refreshTokenService.hash(refreshToken);

        mockMvc.perform(post("/auth/logout")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "refreshToken": "%s"
                        }
                        """.formatted(refreshToken)))
                .andExpect(status().isNoContent())
                .andExpect(header().string("Set-Cookie", org.hamcrest.Matchers.containsString("Max-Age=0")));

        assertThat(refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(refreshTokenHash)).isEmpty();
        assertThat(findTestSessions()).hasSize(1);
        assertThat(findTestSessions().get(0).getRevokedAt()).isNotNull();
    }

    @Test
    void jwksExposesPublicSigningKey() throws Exception {
        mockMvc.perform(get("/.well-known/jwks.json"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.keys[0].kty").value("RSA"))
                .andExpect(jsonPath("$.keys[0].use").value("sig"))
                .andExpect(jsonPath("$.keys[0].alg").value("RS256"))
                .andExpect(jsonPath("$.keys[0].kid").value("auth-key-1"))
                .andExpect(jsonPath("$.keys[0].n", not(emptyOrNullString())))
                .andExpect(jsonPath("$.keys[0].e", not(emptyOrNullString())));
    }

    private JsonNode login(String email, String password) throws Exception {
        String request = """
                {
                    "email": "%s",
                    "password": "%s"
                }
                """.formatted(email, password);

        MvcResult result = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(request))
                .andExpect(status().isOk())
                .andReturn();

        currentRefreshTokenCookie = result.getResponse().getCookie("refreshToken");
        assertThat(currentRefreshTokenCookie).isNotNull();

        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    private List<SesionUsuario> findTestSessions() {
        return entityManager
                .createQuery("select su from SesionUsuario su where su.usuario.correo = :email", SesionUsuario.class)
                .setParameter("email", TEST_EMAIL)
                .getResultList();
    }
}
