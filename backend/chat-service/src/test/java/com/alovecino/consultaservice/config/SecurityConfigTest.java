package com.alovecino.consultaservice.config;

import org.junit.jupiter.api.Test;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class SecurityConfigTest {

    @Test
    void securityConfig_debeTenerEnableMethodSecurityParaAplicarPreAuthorize() {
        assertThat(SecurityConfig.class.isAnnotationPresent(EnableMethodSecurity.class)).isTrue();
    }

    @Test
    void jwtAuthenticationConverter_noDebeDuplicarPrefijoRoleCuandoElTokenYaTraeRole() {
        SecurityConfig securityConfig = new SecurityConfig();
        Converter<Jwt, AbstractAuthenticationToken> converter = securityConfig.jwtAuthenticationConverter();

        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .subject("1")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .claim("roles", List.of("ROLE_CLIENTE"))
                .build();

        assertThat(converter.convert(jwt).getAuthorities())
                .extracting(Object::toString)
                .containsExactly("ROLE_CLIENTE");
    }
}
