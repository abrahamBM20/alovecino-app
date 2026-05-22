package com.alovecino.apigateway.config;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

class JwtDecoderConfigTests {

    private final JwtDecoderConfig config = new JwtDecoderConfig();

    @Test
    void shouldFailFastWhenJwkSetUriIsMissing() {
        GatewayProperties properties = new GatewayProperties();
        properties.getSecurity().getJwt().setIssuer("alovecino-auth");
        properties.getSecurity().getJwt().setAudience("alovecino-api");

        assertThatThrownBy(() -> config.reactiveJwtDecoder(properties))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("gateway.security.jwt.jwk-set-uri must be configured");
    }

    @Test
    void shouldAcceptJwtWithExpectedIssuerAudienceAndNewSessionClaims() {
        GatewayProperties.Jwt properties = jwtProperties();
        Jwt jwt = jwt("alovecino-auth", List.of("alovecino-api"), Map.of(
                "sid", "123",
                "session_id", "123",
                "roles", List.of("ROLE_CLIENTE")));

        assertThat(config.jwtValidator(properties).validate(jwt).hasErrors()).isFalse();
    }

    @Test
    void shouldRejectJwtWithUnexpectedAudience() {
        GatewayProperties.Jwt properties = jwtProperties();
        Jwt jwt = jwt("alovecino-auth", List.of("otro-api"), Map.of());

        assertThat(config.jwtValidator(properties).validate(jwt).hasErrors()).isTrue();
    }

    @Test
    void shouldRejectJwtWithUnexpectedIssuer() {
        GatewayProperties.Jwt properties = jwtProperties();
        Jwt jwt = jwt("otro-issuer", List.of("alovecino-api"), Map.of());

        assertThat(config.jwtValidator(properties).validate(jwt).hasErrors()).isTrue();
    }

    private GatewayProperties.Jwt jwtProperties() {
        GatewayProperties.Jwt jwt = new GatewayProperties.Jwt();
        jwt.setIssuer("alovecino-auth");
        jwt.setAudience("alovecino-api");
        return jwt;
    }

    private Jwt jwt(String issuer, List<String> audience, Map<String, Object> extraClaims) {
        Instant now = Instant.now();
        Jwt.Builder builder = Jwt.withTokenValue("token")
                .header("alg", "RS256")
                .issuer(issuer)
                .audience(audience)
                .issuedAt(now)
                .expiresAt(now.plusSeconds(300));
        extraClaims.forEach(builder::claim);
        return builder.build();
    }
}
