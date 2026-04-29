package com.alovecino.authservice;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.emptyOrNullString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.persistence.EntityManager;

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

    @Autowired
    AuthServiceApplicationTests(MockMvc mockMvc, PasswordEncoder passwordEncoder,
            EntityManager entityManager, PlatformTransactionManager transactionManager) {
        this.mockMvc = mockMvc;
        this.passwordEncoder = passwordEncoder;
        this.entityManager = entityManager;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @BeforeEach
    void setUp() {
        transactionTemplate.executeWithoutResult(status -> {
            entityManager.createQuery("delete from RefreshToken").executeUpdate();
            entityManager.createQuery("delete from Usuario").executeUpdate();
            entityManager.createQuery("delete from Rol").executeUpdate();

            Rol rol = new Rol();
            rol.setNombreRol("USER");
            entityManager.persist(rol);

            Usuario usuario = new Usuario();
            usuario.setNombreUsuario(TEST_EMAIL);
            usuario.setNombre("Usuario Test");
            usuario.setContrasena(passwordEncoder.encode(TEST_PASSWORD));
            usuario.setRol(rol);
            entityManager.persist(usuario);
            entityManager.flush();
        });
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
                .andExpect(jsonPath("$.token", not(emptyOrNullString())))
                .andExpect(jsonPath("$.accessToken", not(emptyOrNullString())))
                .andExpect(jsonPath("$.refreshToken", not(emptyOrNullString())))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value(TEST_EMAIL))
                .andExpect(jsonPath("$.user.name").value("Usuario Test"))
                .andReturn();

        JsonNode response = objectMapper.readTree(result.getResponse().getContentAsString());
        String token = response.get("token").asText();
        String accessToken = response.get("accessToken").asText();

        assertThat(accessToken).isEqualTo(token);
        assertThat(accessToken.split("\\.")).hasSize(3);
    }
}
