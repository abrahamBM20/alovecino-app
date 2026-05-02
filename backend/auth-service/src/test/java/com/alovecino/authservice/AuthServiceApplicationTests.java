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
import com.alovecino.authservice.model.Usuario;
import com.alovecino.authservice.repository.RefreshTokenRepository;
import com.alovecino.authservice.service.RefreshTokenService;

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
        entityManager.createQuery("delete from RefreshToken rt where rt.usuario.nombreUsuario = :email")
                .setParameter("email", TEST_EMAIL)
                .executeUpdate();
        entityManager.createQuery("delete from Usuario u where u.nombreUsuario = :email")
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
                .andExpect(jsonPath("$.refreshToken").doesNotExist())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value(TEST_EMAIL))
                .andExpect(jsonPath("$.user.name").value("Usuario Test"))
                .andReturn();

        JsonNode response = objectMapper.readTree(result.getResponse().getContentAsString());
        String accessToken = response.get("accessToken").asText();
        Cookie refreshTokenCookie = result.getResponse().getCookie("refreshToken");

        assertThat(accessToken.split("\\.")).hasSize(3);
        assertThat(refreshTokenCookie).isNotNull();
        assertThat(refreshTokenCookie.getValue()).isNotBlank();
        assertThat(refreshTokenCookie.isHttpOnly()).isTrue();
        assertThat(result.getResponse().getHeader("Set-Cookie")).contains("SameSite=Lax");
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

        MvcResult refreshResult = mockMvc.perform(post("/auth/refresh")
                .cookie(currentRefreshTokenCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", not(emptyOrNullString())))
                .andExpect(jsonPath("$.refreshToken").doesNotExist())
                .andExpect(jsonPath("$.token").doesNotExist())
                .andReturn();

        Cookie newRefreshTokenCookie = refreshResult.getResponse().getCookie("refreshToken");
        String newRefreshToken = newRefreshTokenCookie.getValue();

        assertThat(newRefreshTokenCookie).isNotNull();
        assertThat(newRefreshTokenCookie.isHttpOnly()).isTrue();
        assertThat(newRefreshToken).isNotEqualTo(oldRefreshToken);
        assertThat(refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(
                refreshTokenService.hash(oldRefreshToken))).isEmpty();
        assertThat(refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(
                refreshTokenService.hash(newRefreshToken))).isPresent();

        mockMvc.perform(post("/auth/refresh")
                .cookie(currentRefreshTokenCookie))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Refresh token inválido"));
    }

    @Test
    void refreshReturnsUnauthorizedForExpiredRefreshToken() throws Exception {
        JsonNode loginResponse = login(TEST_EMAIL, TEST_PASSWORD);
        String refreshToken = currentRefreshTokenCookie.getValue();
        String refreshTokenHash = refreshTokenService.hash(refreshToken);

        transactionTemplate.executeWithoutResult(status -> refreshTokenRepository
                .findByTokenHashAndRevokedAtIsNull(refreshTokenHash)
                .ifPresent(token -> token.setExpiresAt(Instant.now().minusSeconds(1))));

        mockMvc.perform(post("/auth/refresh")
                .cookie(currentRefreshTokenCookie))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Refresh token inválido"));

        assertThat(refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(refreshTokenHash)).isEmpty();
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

        mockMvc.perform(post("/auth/refresh")
                .cookie(currentRefreshTokenCookie))
                .andExpect(status().isUnauthorized());
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
}
