package com.alovecino.authservice.service;

import java.time.Instant;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alovecino.authservice.config.JwtProperties;
import com.alovecino.authservice.dto.LoginRequest;
import com.alovecino.authservice.dto.LogoutRequest;
import com.alovecino.authservice.dto.RefreshTokenRequest;
import com.alovecino.authservice.dto.SessionUserResponse;
import com.alovecino.authservice.dto.TokenResponse;
import com.alovecino.authservice.model.RefreshToken;
import com.alovecino.authservice.model.Usuario;
import com.alovecino.authservice.repository.RefreshTokenRepository;
import com.alovecino.authservice.repository.UsuarioRepository;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProperties jwtProperties;
    private final JwtTokenService jwtTokenService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(UsuarioRepository usuarioRepository, RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder, JwtProperties jwtProperties, JwtTokenService jwtTokenService,
            RefreshTokenService refreshTokenService) {
        this.usuarioRepository = usuarioRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtProperties = jwtProperties;
        this.jwtTokenService = jwtTokenService;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByNombreUsuario(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getContrasena())) {
            throw new BadCredentialsException("Credenciales inválidas");
        }

        return issueTokens(usuario);
    }

    @Transactional
    public TokenResponse refresh(RefreshTokenRequest request) {
        String tokenHash = refreshTokenService.hash(request.getRefreshToken());
        RefreshToken refreshToken = refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(tokenHash)
                .orElseThrow(InvalidRefreshTokenException::new);

        Instant now = Instant.now();
        if (refreshToken.getExpiresAt().isBefore(now)) {
            refreshToken.setRevokedAt(now);
            throw new InvalidRefreshTokenException();
        }

        refreshToken.setRevokedAt(now);
        return issueTokens(refreshToken.getUsuario());
    }

    @Transactional
    public void logout(LogoutRequest request) {
        String tokenHash = refreshTokenService.hash(request.getRefreshToken());
        refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(tokenHash)
                .ifPresent(refreshToken -> refreshToken.setRevokedAt(Instant.now()));
    }

    private TokenResponse issueTokens(Usuario usuario) {
        Instant now = Instant.now();
        Instant accessExpiresAt = now.plus(jwtProperties.getAccessTokenTtl());
        RefreshTokenService.CreatedRefreshToken createdRefreshToken = refreshTokenService.create(usuario, now);
        String accessToken = jwtTokenService.createAccessToken(usuario, now, accessExpiresAt);
        SessionUserResponse user = new SessionUserResponse(
                String.valueOf(usuario.getIdUsuario()),
                usuario.getNombre(),
                usuario.getNombreUsuario());
        return new TokenResponse(accessToken, createdRefreshToken.token(), accessExpiresAt,
                createdRefreshToken.expiresAt(), user);
    }
}
