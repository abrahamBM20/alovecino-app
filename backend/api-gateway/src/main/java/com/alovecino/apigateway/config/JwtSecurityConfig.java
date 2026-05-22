package com.alovecino.apigateway.config;

import java.nio.charset.StandardCharsets;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.ServerAuthenticationEntryPoint;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authorization.ServerAccessDeniedHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import reactor.core.publisher.Mono;

@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
public class JwtSecurityConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(JwtSecurityConfig.class);
    private static final String REQUEST_ID_HEADER = "X-Request-Id";

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchange -> exchange
                        .pathMatchers(
                                "/",
                                "/auth/login",
                                "/auth/refresh",
                                "/auth/logout",
                                "/.well-known/jwks.json",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/actuator/health",
                                "/actuator/health/**",
                                "/actuator/info")
                        .permitAll()
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .pathMatchers(HttpMethod.POST, "/api/usuarios").permitAll()
                        .anyExchange()
                        .authenticated())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint())
                        .accessDeniedHandler(accessDeniedHandler()))
                .oauth2ResourceServer(oauth2 -> oauth2
                        .authenticationEntryPoint(authenticationEntryPoint())
                        .jwt(jwt -> {}))
                .build();
    }

    private ServerAuthenticationEntryPoint authenticationEntryPoint() {
        return (exchange, ex) -> {
            String path = exchange.getRequest().getPath().value();
            String requestId = exchange.getRequest().getHeaders().getFirst(REQUEST_ID_HEADER);
            LOGGER.warn("JWT authentication failed path={} requestId={} reason={}",
                    path, requestId, ex.getClass().getSimpleName());
            return writeJson(exchange, HttpStatus.UNAUTHORIZED, "Token requerido o invalido");
        };
    }

    private ServerAccessDeniedHandler accessDeniedHandler() {
        return (exchange, ex) -> {
            String path = exchange.getRequest().getPath().value();
            String requestId = exchange.getRequest().getHeaders().getFirst(REQUEST_ID_HEADER);
            LOGGER.warn("JWT authorization denied path={} requestId={} reason={}",
                    path, requestId, ex.getClass().getSimpleName());
            return writeJson(exchange, HttpStatus.FORBIDDEN, "No autorizado");
        };
    }

    private Mono<Void> writeJson(org.springframework.web.server.ServerWebExchange exchange,
            HttpStatus status, String message) {
        byte[] bytes = ("{\"message\":\"" + message + "\"}").getBytes(StandardCharsets.UTF_8);
        exchange.getResponse().setStatusCode(status);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(bytes);
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }
}
