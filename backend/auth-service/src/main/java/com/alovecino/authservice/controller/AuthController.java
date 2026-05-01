package com.alovecino.authservice.controller;

import java.util.Map;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.alovecino.authservice.dto.LoginRequest;
import com.alovecino.authservice.dto.LogoutRequest;
import com.alovecino.authservice.dto.RefreshTokenRequest;
import com.alovecino.authservice.dto.TokenResponse;
import com.alovecino.authservice.service.AuthService;
import com.alovecino.authservice.service.InvalidRefreshTokenException;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            TokenResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Credenciales inválidas"));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            TokenResponse response = authService.refresh(request);
            return ResponseEntity.ok(response);
        } catch (InvalidRefreshTokenException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Refresh token inválido"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody LogoutRequest request) {
        authService.logout(request);
        return ResponseEntity.noContent().build();
    }
}
