package com.alovecino.apigateway.config;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

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
}
