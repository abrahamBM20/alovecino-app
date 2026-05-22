package com.alovecino.apigateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRoutesConfig {

    @Bean
    public RouteLocator gatewayRoutes(RouteLocatorBuilder builder, GatewayProperties properties) {
        String authUrl = properties.getServices().getAuth().getBaseUrl();
        String usuariosUrl = properties.getServices().getUsuarios().getBaseUrl();
        String geoUrl = properties.getServices().getGeo().getBaseUrl();
        String chatUrl = properties.getServices().getChat().getBaseUrl();

        return builder.routes()
                .route("auth-api", route -> route
                        .path("/auth/**")
                        .uri(authUrl))
                .route("auth-jwks", route -> route
                        .path("/.well-known/jwks.json")
                        .uri(authUrl))
                .route("usuarios-api", route -> route
                        .path("/api/usuarios/**")
                        .uri(usuariosUrl))
                .route("almacenes-api", route -> route
                        .path("/api/almacenes/**")
                        .uri(usuariosUrl))
                .route("consultas-api", route -> route
                        .path("/api/consultas/**")
                        .uri(chatUrl))
                .route("estados-consulta-api", route -> route
                        .path("/api/estados-consulta/**")
                        .uri(chatUrl))
                .route("valoraciones-api", route -> route
                        .path("/api/valoraciones/**")
                        .uri(usuariosUrl))
                .route("ofertas-api", route -> route
                        .path("/api/ofertas/**")
                        .uri(usuariosUrl))
                .route("geo-api", route -> route
                        .path("/api/geo/**")
                        .uri(geoUrl))
                .route("usuarios-docs", route -> route
                        .path("/v3/api-docs/**", "/swagger-ui/**")
                        .uri(usuariosUrl))
                .route("root-redirect", route -> route
                        .path("/")
                        .filters(filters -> filters.redirect(302, "/swagger-ui/index.html"))
                        .uri("no://op"))
                .build();
    }
}
