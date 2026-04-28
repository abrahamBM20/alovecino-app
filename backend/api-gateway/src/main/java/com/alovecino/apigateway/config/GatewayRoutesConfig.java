package com.alovecino.apigateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRoutesConfig {

    @Bean
    public RouteLocator gatewayRoutes(RouteLocatorBuilder builder, GatewayProperties properties) {
        String usuariosUrl = properties.getServices().getUsuarios().getBaseUrl();

        return builder.routes()
                .route("usuarios-auth", route -> route
                        .path("/auth/**")
                        .uri(usuariosUrl))
                .route("usuarios-api", route -> route
                        .path("/api/usuarios/**")
                        .uri(usuariosUrl))
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
