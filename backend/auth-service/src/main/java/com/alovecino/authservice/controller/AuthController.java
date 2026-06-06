package com.alovecino.authservice.controller;

import java.util.Map;

import jakarta.validation.Valid;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.alovecino.authservice.config.JwtProperties;
import com.alovecino.authservice.dto.LoginRequest;
import com.alovecino.authservice.dto.LogoutRequest;
import com.alovecino.authservice.dto.RefreshTokenRequest;
import com.alovecino.authservice.dto.TokenResponse;
import com.alovecino.authservice.service.AuthService;
import com.alovecino.authservice.service.InvalidRefreshTokenException;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final String REFRESH_TOKEN_COOKIE = "refreshToken";

    private final AuthService authService;
    private final JwtProperties jwtProperties;

    public AuthController(AuthService authService, JwtProperties jwtProperties) {
        this.authService = authService;
        this.jwtProperties = jwtProperties;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            TokenResponse response = authService.login(request);
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, refreshTokenCookie(response).toString())
                    .body(response);
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Credenciales inválidas"));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @CookieValue(name = REFRESH_TOKEN_COOKIE, required = false) String refreshToken,
            @RequestBody(required = false) RefreshTokenRequest request) {
        String resolvedRefreshToken = resolveRefreshToken(refreshToken, request);
        if (resolvedRefreshToken == null || resolvedRefreshToken.isBlank()) {
            return invalidRefreshToken();
        }

        try {
            TokenResponse response = authService.refresh(resolvedRefreshToken);
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, refreshTokenCookie(response).toString())
                    .body(response);
        } catch (InvalidRefreshTokenException ex) {
            return invalidRefreshToken();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = REFRESH_TOKEN_COOKIE, required = false) String refreshToken,
            @RequestBody(required = false) LogoutRequest request) {
        String resolvedRefreshToken = resolveRefreshToken(refreshToken, request);
        if (resolvedRefreshToken != null && !resolvedRefreshToken.isBlank()) {
            authService.logout(resolvedRefreshToken);
        }

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, clearRefreshTokenCookie().toString())
                .build();
    }

    private ResponseEntity<?> invalidRefreshToken() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .header(HttpHeaders.SET_COOKIE, clearRefreshTokenCookie().toString())
                .body(Map.of("message", "Refresh token inválido"));
    }

    private String resolveRefreshToken(String cookieRefreshToken, RefreshTokenRequest request) {
        if (request != null && request.getRefreshToken() != null && !request.getRefreshToken().isBlank()) {
            return request.getRefreshToken();
        }

        return cookieRefreshToken;
    }

    private String resolveRefreshToken(String cookieRefreshToken, LogoutRequest request) {
        if (request != null && request.getRefreshToken() != null && !request.getRefreshToken().isBlank()) {
            return request.getRefreshToken();
        }

        return cookieRefreshToken;
    }

    private ResponseCookie refreshTokenCookie(TokenResponse response) {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE, response.getRefreshToken())
                .httpOnly(true)
                .secure(jwtProperties.isRefreshCookieSecure())
                .sameSite(jwtProperties.getRefreshCookieSameSite())
                .path("/auth")
                .maxAge(jwtProperties.getRefreshTokenTtl())
                .build();
    }

    private ResponseCookie clearRefreshTokenCookie() {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE, "")
                .httpOnly(true)
                .secure(jwtProperties.isRefreshCookieSecure())
                .sameSite(jwtProperties.getRefreshCookieSameSite())
                .path("/auth")
                .maxAge(0)
                .build();
    }
}
