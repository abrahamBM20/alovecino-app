package com.alovecino.authservice.service;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.alovecino.authservice.config.JwtProperties;
import com.alovecino.authservice.config.RsaKeyConfig.RsaKeyPair;
import com.alovecino.authservice.model.Usuario;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

@Service
public class JwtTokenService {

    private final JwtProperties jwtProperties;
    private final RsaKeyPair rsaKeyPair;

    public JwtTokenService(JwtProperties jwtProperties, RsaKeyPair rsaKeyPair) {
        this.jwtProperties = jwtProperties;
        this.rsaKeyPair = rsaKeyPair;
    }

    public String createAccessToken(Usuario usuario, Instant issuedAt, Instant expiresAt) {
        String role = "ROLE_" + usuario.getRol().getNombreRol();
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer(jwtProperties.getIssuer())
                .audience(jwtProperties.getAudience())
                .subject(String.valueOf(usuario.getIdUsuario()))
                .issueTime(Date.from(issuedAt))
                .expirationTime(Date.from(expiresAt))
                .jwtID(UUID.randomUUID().toString())
                .claim("typ", "access")
                .claim("username", usuario.getNombreUsuario())
                .claim("email", usuario.getNombreUsuario())
                .claim("name", usuario.getNombre())
                .claim("roles", List.of(role))
                .claim("scope", role)
                .build();

        SignedJWT signedJwt = new SignedJWT(
                new JWSHeader.Builder(JWSAlgorithm.RS256).keyID(jwtProperties.getKeyId()).build(),
                claims);
        try {
            signedJwt.sign(new RSASSASigner(rsaKeyPair.privateKey()));
        } catch (JOSEException ex) {
            throw new IllegalStateException("Could not sign JWT", ex);
        }
        return signedJwt.serialize();
    }
}
