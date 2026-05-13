package com.alovecino.authservice.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Base64;

import org.springframework.stereotype.Service;

import com.alovecino.authservice.config.JwtProperties;
import com.alovecino.authservice.model.RefreshToken;
import com.alovecino.authservice.model.SesionUsuario;
import com.alovecino.authservice.repository.RefreshTokenRepository;

@Service
public class RefreshTokenService {

    private final SecureRandom secureRandom = new SecureRandom();
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProperties jwtProperties;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, JwtProperties jwtProperties) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtProperties = jwtProperties;
    }

    public CreatedRefreshToken create(SesionUsuario sesionUsuario, Instant now) {
        String token = generateToken();
        Instant expiresAt = now.plus(jwtProperties.getRefreshTokenTtl());

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setTokenHash(hash(token));
        refreshToken.setSesionUsuario(sesionUsuario);
        refreshToken.setCreatedAt(now);
        refreshToken.setExpiresAt(expiresAt);
        refreshTokenRepository.save(refreshToken);

        return new CreatedRefreshToken(token, expiresAt);
    }

    public String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (Exception ex) {
            throw new IllegalStateException("Could not hash refresh token", ex);
        }
    }

    private String generateToken() {
        byte[] bytes = new byte[64];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public record CreatedRefreshToken(String token, Instant expiresAt) {
    }
}
