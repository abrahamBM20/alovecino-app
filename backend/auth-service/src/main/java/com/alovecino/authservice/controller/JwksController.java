package com.alovecino.authservice.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.alovecino.authservice.config.JwtProperties;
import com.alovecino.authservice.config.RsaKeyConfig.RsaKeyPair;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.jwk.RSAKey;

@RestController
public class JwksController {

    private final JwtProperties jwtProperties;
    private final RsaKeyPair rsaKeyPair;

    public JwksController(JwtProperties jwtProperties, RsaKeyPair rsaKeyPair) {
        this.jwtProperties = jwtProperties;
        this.rsaKeyPair = rsaKeyPair;
    }

    @GetMapping("/.well-known/jwks.json")
    public Map<String, Object> jwks() {
        RSAKey rsaKey = new RSAKey.Builder(rsaKeyPair.publicKey())
                .keyUse(KeyUse.SIGNATURE)
                .algorithm(JWSAlgorithm.RS256)
                .keyID(jwtProperties.getKeyId())
                .build();

        return Map.of("keys", List.of(rsaKey.toPublicJWK().toJSONObject()));
    }
}
