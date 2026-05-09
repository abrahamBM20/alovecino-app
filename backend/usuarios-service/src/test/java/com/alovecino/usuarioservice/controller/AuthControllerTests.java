package com.alovecino.usuarioservice.controller;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthControllerTests {

        private final HttpClient httpClient = HttpClient.newHttpClient();
        private final ObjectMapper objectMapper = new ObjectMapper();

        @LocalServerPort
        private int port;

        private String baseUrl() {
                return "http://localhost:" + port;
        }

        @Test
        void shouldLoginSuccessfullyWithValidCredentials() throws Exception {
                String payload = """
                                {
                                  "email": "admin@alovecino.com",
                                  "password": "admin1234"
                                }
                                """;

                HttpResponse<String> response = post("/auth/login", payload);
                Map<String, Object> body = parse(response.body());

                assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());
                assertThat(body).containsKey("token");
                assertThat(((Map<?, ?>) body.get("user")).get("email")).isEqualTo("admin@alovecino.com");
        }

        @Test
        void shouldReturnUnauthorizedWithInvalidCredentials() throws Exception {
                String payload = """
                                {
                                  "email": "admin@alovecino.com",
                                  "password": "wrong-password"
                                }
                                """;

                HttpResponse<String> response = post("/auth/login", payload);
                Map<String, Object> body = parse(response.body());

                assertThat(response.statusCode()).isEqualTo(HttpStatus.UNAUTHORIZED.value());
                assertThat(body.get("message")).isEqualTo("Credenciales inválidas");
        }

        @Test
        void shouldExposeSwaggerDocsIncludingLoginEndpoint() throws Exception {
                HttpResponse<String> response = get("/v3/api-docs");
                Map<String, Object> body = parse(response.body());

                assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());
                assertThat(body).containsKey("paths");

                Map<?, ?> paths = (Map<?, ?>) body.get("paths");
                assertThat(paths.containsKey("/auth/login")).isTrue();
        }

        private HttpResponse<String> post(String path, String jsonBody) throws IOException, InterruptedException {
                HttpRequest request = HttpRequest.newBuilder()
                                .uri(URI.create(baseUrl() + path))
                                .header("Content-Type", "application/json")
                                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                                .build();

                return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        }

        private HttpResponse<String> get(String path) throws IOException, InterruptedException {
                HttpRequest request = HttpRequest.newBuilder()
                                .uri(URI.create(baseUrl() + path))
                                .GET()
                                .build();

                return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        }

        private Map<String, Object> parse(String json) throws IOException {
                return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {
                });
        }
}
