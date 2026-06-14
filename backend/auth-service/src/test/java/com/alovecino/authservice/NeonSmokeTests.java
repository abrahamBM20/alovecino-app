package com.alovecino.authservice;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.emptyOrNullString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.UUID;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import com.alovecino.authservice.service.RefreshTokenService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jwt.SignedJWT;

@SpringBootTest(properties = "spring.test.database.replace=none")
@AutoConfigureMockMvc
@EnabledIfSystemProperty(named = "neonSmoke", matches = "true")
class NeonSmokeTests {

    private static final String TEST_PASSWORD = "AuthSmoke123";

    private final MockMvc mockMvc;
    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String email;
    private String username;
    private String rut;

    @DynamicPropertySource
    static void neonProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> requiredEnv("SPRING_DATASOURCE_URL"));
        registry.add("spring.datasource.username", () -> requiredEnv("SPRING_DATASOURCE_USERNAME"));
        registry.add("spring.datasource.password", () -> requiredEnv("SPRING_DATASOURCE_PASSWORD"));
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.PostgreSQLDialect");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
    }

    @Autowired
    NeonSmokeTests(MockMvc mockMvc, JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder,
            RefreshTokenService refreshTokenService) {
        this.mockMvc = mockMvc;
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
    }

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        email = "auth-smoke-" + suffix + "@alovecino.test";
        username = "auth-smoke-" + suffix;
        rut = createValidRut(suffix);

        Long roleId = jdbcTemplate.queryForObject(
                "select id_rol from rol where nombre_rol = 'CLIENTE' order by id_rol limit 1",
                Long.class);

        jdbcTemplate.update("""
                insert into usuario (rut, nombre_usuario, nombre, correo, contrasena, id_rol)
                values (?, ?, ?, ?, ?, ?)
                """, rut, username, "Auth Smoke", email, passwordEncoder.encode(TEST_PASSWORD), roleId);
    }

    @AfterEach
    void tearDown() {
        jdbcTemplate.update("""
                delete from refresh_token
                where id_sesion_usuario in (
                    select su.id_sesion_usuario
                    from sesion_usuario su
                    join usuario u on u.id_usuario = su.id_usuario
                    where u.correo = ?
                )
                """, email);
        jdbcTemplate.update("""
                delete from sesion_usuario
                where id_usuario in (select id_usuario from usuario where correo = ?)
                """, email);
        jdbcTemplate.update("delete from usuario where correo = ?", email);
    }

    @Test
    void loginRefreshAndLogoutWorkAgainstNeonSchema() throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "email": "%s",
                            "password": "%s"
                        }
                        """.formatted(email, TEST_PASSWORD)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", not(emptyOrNullString())))
                .andExpect(jsonPath("$.refreshToken", not(emptyOrNullString())))
                .andExpect(jsonPath("$.user.email").value(email))
                .andReturn();

        Cookie loginRefreshCookie = loginResult.getResponse().getCookie("refreshToken");
        assertThat(loginRefreshCookie).isNotNull();

        JsonNode loginBody = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        SignedJWT loginJwt = SignedJWT.parse(loginBody.get("accessToken").asText());
        String sessionId = loginJwt.getJWTClaimsSet().getStringClaim("sid");
        assertThat(sessionId).isNotBlank();
        assertThat(loginJwt.getJWTClaimsSet().getStringListClaim("roles")).containsExactly("ROLE_CLIENTE");

        String oldRefreshTokenHash = refreshTokenService.hash(loginRefreshCookie.getValue());
        assertThat(countActiveSessions()).isEqualTo(1);
        assertThat(countActiveRefreshTokens()).isEqualTo(1);
        assertThat(countRefreshTokensByHash(oldRefreshTokenHash)).isEqualTo(1);

        MvcResult refreshResult = mockMvc.perform(post("/auth/refresh")
                .cookie(loginRefreshCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", not(emptyOrNullString())))
                .andExpect(jsonPath("$.refreshToken", not(emptyOrNullString())))
                .andReturn();

        Cookie rotatedRefreshCookie = refreshResult.getResponse().getCookie("refreshToken");
        assertThat(rotatedRefreshCookie).isNotNull();
        assertThat(rotatedRefreshCookie.getValue()).isNotEqualTo(loginRefreshCookie.getValue());
        assertThat(countActiveSessions()).isEqualTo(1);
        assertThat(countActiveRefreshTokens()).isEqualTo(1);
        assertThat(countActiveRefreshTokensByHash(oldRefreshTokenHash)).isZero();

        SignedJWT refreshJwt = SignedJWT.parse(
                objectMapper.readTree(refreshResult.getResponse().getContentAsString()).get("accessToken").asText());
        assertThat(refreshJwt.getJWTClaimsSet().getStringClaim("sid")).isEqualTo(sessionId);

        mockMvc.perform(post("/auth/logout")
                .cookie(rotatedRefreshCookie))
                .andExpect(status().isNoContent());

        assertThat(countActiveSessions()).isZero();
        assertThat(countActiveRefreshTokens()).isZero();
        assertThat(countRevokedSessions()).isEqualTo(1);
        assertThat(countRevokedRefreshTokens()).isEqualTo(2);
        assertThat(latestRevokedAt()).isNotNull().isBeforeOrEqualTo(Instant.now());
    }

    private Integer countActiveSessions() {
        return jdbcTemplate.queryForObject("""
                select count(*)
                from sesion_usuario su
                join usuario u on u.id_usuario = su.id_usuario
                where u.correo = ? and su.revoked_at is null
                """, Integer.class, email);
    }

    private Integer countRevokedSessions() {
        return jdbcTemplate.queryForObject("""
                select count(*)
                from sesion_usuario su
                join usuario u on u.id_usuario = su.id_usuario
                where u.correo = ? and su.revoked_at is not null
                """, Integer.class, email);
    }

    private Integer countActiveRefreshTokens() {
        return jdbcTemplate.queryForObject("""
                select count(*)
                from refresh_token rt
                join sesion_usuario su on su.id_sesion_usuario = rt.id_sesion_usuario
                join usuario u on u.id_usuario = su.id_usuario
                where u.correo = ? and rt.fecha_revocacion is null
                """, Integer.class, email);
    }

    private Integer countRevokedRefreshTokens() {
        return jdbcTemplate.queryForObject("""
                select count(*)
                from refresh_token rt
                join sesion_usuario su on su.id_sesion_usuario = rt.id_sesion_usuario
                join usuario u on u.id_usuario = su.id_usuario
                where u.correo = ? and rt.fecha_revocacion is not null
                """, Integer.class, email);
    }

    private Integer countRefreshTokensByHash(String tokenHash) {
        return jdbcTemplate.queryForObject("select count(*) from refresh_token where hash_token = ?",
                Integer.class, tokenHash);
    }

    private Integer countActiveRefreshTokensByHash(String tokenHash) {
        return jdbcTemplate.queryForObject(
                "select count(*) from refresh_token where hash_token = ? and fecha_revocacion is null",
                Integer.class, tokenHash);
    }

    private Instant latestRevokedAt() {
        return jdbcTemplate.queryForObject("""
                select max(rt.fecha_revocacion)
                from refresh_token rt
                join sesion_usuario su on su.id_sesion_usuario = rt.id_sesion_usuario
                join usuario u on u.id_usuario = su.id_usuario
                where u.correo = ?
                """, Instant.class, email);
    }

    private String createValidRut(String suffix) {
        int body = 9_000_000 + Math.floorMod(suffix.hashCode(), 900_000);
        return body + "-" + calculateRutDv(String.valueOf(body));
    }

    private String calculateRutDv(String rutBody) {
        int sum = 0;
        int multiplier = 2;
        for (int i = rutBody.length() - 1; i >= 0; i--) {
            sum += Character.digit(rutBody.charAt(i), 10) * multiplier;
            multiplier = multiplier == 7 ? 2 : multiplier + 1;
        }
        int remainder = 11 - (sum % 11);
        if (remainder == 11) {
            return "0";
        }
        if (remainder == 10) {
            return "K";
        }
        return String.valueOf(remainder);
    }

    private static String requiredEnv(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(name + " is required for Neon smoke tests");
        }
        return value;
    }
}
