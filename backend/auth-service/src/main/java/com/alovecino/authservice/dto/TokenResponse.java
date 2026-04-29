package com.alovecino.authservice.dto;

import java.time.Instant;

public class TokenResponse {

    private String token;
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private Instant accessTokenExpiresAt;
    private Instant refreshTokenExpiresAt;
    private SessionUserResponse user;

    public TokenResponse() {
    }

    public TokenResponse(String accessToken, String refreshToken, Instant accessTokenExpiresAt,
            Instant refreshTokenExpiresAt, SessionUserResponse user) {
        this.token = accessToken;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.accessTokenExpiresAt = accessTokenExpiresAt;
        this.refreshTokenExpiresAt = refreshTokenExpiresAt;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public Instant getAccessTokenExpiresAt() {
        return accessTokenExpiresAt;
    }

    public void setAccessTokenExpiresAt(Instant accessTokenExpiresAt) {
        this.accessTokenExpiresAt = accessTokenExpiresAt;
    }

    public Instant getRefreshTokenExpiresAt() {
        return refreshTokenExpiresAt;
    }

    public void setRefreshTokenExpiresAt(Instant refreshTokenExpiresAt) {
        this.refreshTokenExpiresAt = refreshTokenExpiresAt;
    }

    public SessionUserResponse getUser() {
        return user;
    }

    public void setUser(SessionUserResponse user) {
        this.user = user;
    }
}
