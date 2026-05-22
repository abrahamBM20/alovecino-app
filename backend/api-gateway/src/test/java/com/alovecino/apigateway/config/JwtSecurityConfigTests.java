package com.alovecino.apigateway.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "gateway.services.auth.base-url=http://auth-service:8081",
        "gateway.services.usuarios.base-url=http://usuarios-service:8080",
        "gateway.services.geo.base-url=http://geo-service:8083",
        "gateway.security.jwt.jwk-set-uri=http://auth-service:8081/.well-known/jwks.json",
        "gateway.security.jwt.issuer=alovecino-auth",
        "gateway.security.jwt.audience=alovecino-api",
        "management.endpoint.health.probes.enabled=true"
})
class JwtSecurityConfigTests {

    private static final String REQUEST_ID_HEADER = "X-Request-Id";

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @LocalServerPort
    private int port;

    @Test
    void shouldAllowHealthEndpointsWithoutToken() throws Exception {
        assertThat(get("/actuator/health").statusCode()).isEqualTo(HttpStatus.OK.value());
        assertThat(get("/actuator/health/liveness").statusCode()).isEqualTo(HttpStatus.OK.value());
        assertThat(get("/actuator/health/readiness").statusCode()).isEqualTo(HttpStatus.OK.value());
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "/api/usuarios",
            "/api/usuarios/me",
            "/api/almacenes",
            "/api/consultas",
            "/api/valoraciones",
            "/api/ofertas",
            "/api/geo/stores"
    })
    void shouldRequireTokenForProtectedRoutes(String path) throws Exception {
        HttpResponse<String> response = get(path);

        assertThat(response.statusCode()).isEqualTo(HttpStatus.UNAUTHORIZED.value());
        assertThat(response.body()).isEqualTo("{\"message\":\"Token requerido o invalido\"}");
        assertThat(response.headers().firstValue(REQUEST_ID_HEADER)).isPresent();
    }

    @Test
    void shouldAllowRegistrationPreflightFromExpoWebWithoutToken() throws Exception {
        HttpResponse<String> response = options("/api/usuarios", "http://localhost:8081", "POST");

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());
        assertThat(response.headers().firstValue(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN))
                .contains("http://localhost:8081");
        assertThat(response.headers().firstValue(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS))
                .hasValueSatisfying(methods -> assertThat(methods).contains("POST"));
    }

    @Test
    void shouldRequireTokenForNestedUserPostRoutes() throws Exception {
        HttpResponse<String> response = post("/api/usuarios/me");

        assertThat(response.statusCode()).isEqualTo(HttpStatus.UNAUTHORIZED.value());
        assertThat(response.body()).isEqualTo("{\"message\":\"Token requerido o invalido\"}");
    }

    @Test
    void shouldAllowUserRegistrationWithoutToken() throws Exception {
        HttpResponse<String> response = post("/api/usuarios");

        assertThat(response.statusCode()).isNotEqualTo(HttpStatus.UNAUTHORIZED.value());
    }

    private HttpResponse<String> get(String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .GET()
                .build();

        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> options(String path, String origin, String method) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .method("OPTIONS", HttpRequest.BodyPublishers.noBody())
                .header(HttpHeaders.ORIGIN, origin)
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, method)
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "content-type")
                .build();

        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> post(String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .POST(HttpRequest.BodyPublishers.ofString("{}"))
                .build();

        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }
}
