package com.alovecino.apigateway.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.route.RouteLocator;

@SpringBootTest(properties = {
        "gateway.services.auth.base-url=http://auth-service:8081",
        "gateway.services.usuarios.base-url=http://usuarios-service:8080",
        "gateway.security.jwt.jwk-set-uri=http://auth-service:8081/.well-known/jwks.json",
        "gateway.security.jwt.issuer=alovecino-auth",
        "gateway.security.jwt.audience=alovecino-api"
})
class GatewayRoutesConfigTests {

    @Autowired
    private RouteLocator routeLocator;

    @Test
    void shouldRegisterExpectedGatewayRoutes() {
        Map<String, Route> routes = routeLocator.getRoutes()
                .collectList()
                .block()
                .stream()
                .collect(Collectors.toMap(Route::getId, Function.identity()));

        assertThat(routes).containsOnlyKeys(
                "auth-api",
                "auth-jwks",
                "usuarios-api",
                "almacenes-api",
                "usuarios-docs",
                "root-redirect");
        assertThat(routes.get("auth-api").getUri().toString()).isEqualTo("http://auth-service:8081");
        assertThat(routes.get("auth-jwks").getUri().toString()).isEqualTo("http://auth-service:8081");
        assertThat(routes.get("usuarios-api").getUri().toString()).isEqualTo("http://usuarios-service:8080");
        assertThat(routes.get("almacenes-api").getUri().toString()).isEqualTo("http://usuarios-service:8080");
        assertThat(routes.get("usuarios-docs").getUri().toString()).isEqualTo("http://usuarios-service:8080");
        assertThat(routes.get("root-redirect").getUri().toString()).isEqualTo("no://op");
    }
}
