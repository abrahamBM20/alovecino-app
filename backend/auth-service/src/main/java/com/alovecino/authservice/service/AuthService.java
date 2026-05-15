package com.alovecino.authservice.service;

import java.time.Instant;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alovecino.authservice.config.JwtProperties;
import com.alovecino.authservice.dto.LoginRequest;
import com.alovecino.authservice.dto.SessionUserResponse;
import com.alovecino.authservice.dto.TokenResponse;
import com.alovecino.authservice.model.RefreshToken;
import com.alovecino.authservice.model.SesionUsuario;
import com.alovecino.authservice.model.Usuario;
import com.alovecino.authservice.repository.RefreshTokenRepository;
import com.alovecino.authservice.repository.SesionUsuarioRepository;
import com.alovecino.authservice.repository.UsuarioRepository;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final SesionUsuarioRepository sesionUsuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProperties jwtProperties;
    private final JwtTokenService jwtTokenService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(UsuarioRepository usuarioRepository, RefreshTokenRepository refreshTokenRepository,
            SesionUsuarioRepository sesionUsuarioRepository, PasswordEncoder passwordEncoder,
            JwtProperties jwtProperties, JwtTokenService jwtTokenService, RefreshTokenService refreshTokenService) {
        this.usuarioRepository = usuarioRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.sesionUsuarioRepository = sesionUsuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtProperties = jwtProperties;
        this.jwtTokenService = jwtTokenService;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByCorreo(request.getEmail())
                .or(() -> usuarioRepository.findByNombreUsuario(request.getEmail()))
                .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getContrasena())) {
            throw new BadCredentialsException("Credenciales inválidas");
        }

        Instant now = Instant.now();
        SesionUsuario sesionUsuario = new SesionUsuario();
        sesionUsuario.setUsuario(usuario);
        sesionUsuario.setCreatedAt(now);
        sesionUsuario.setLastUsedAt(now);
        sesionUsuarioRepository.save(sesionUsuario);

        return issueTokens(sesionUsuario, now);
    }

    @Transactional(noRollbackFor = InvalidRefreshTokenException.class)
    public TokenResponse refresh(String refreshTokenValue) {
        String tokenHash = refreshTokenService.hash(refreshTokenValue);
        RefreshToken refreshToken = refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(tokenHash)
                .orElseThrow(InvalidRefreshTokenException::new);

        Instant now = Instant.now();
        SesionUsuario sesionUsuario = refreshToken.getSesionUsuario();
        if (refreshToken.getExpiresAt().isBefore(now) || !sesionUsuario.isActive()) {
            refreshToken.setRevokedAt(now);
            throw new InvalidRefreshTokenException();
        }

        refreshToken.setRevokedAt(now);
        sesionUsuario.setLastUsedAt(now);
        return issueTokens(sesionUsuario, now);
    }

    @Transactional
    public void logout(String refreshTokenValue) {
        String tokenHash = refreshTokenService.hash(refreshTokenValue);
        refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(tokenHash)
                .ifPresent(refreshToken -> {
                    Instant now = Instant.now();
                    refreshToken.setRevokedAt(now);
                    refreshToken.getSesionUsuario().setRevokedAt(now);
                });
    }

    private TokenResponse issueTokens(SesionUsuario sesionUsuario, Instant now) {
        Usuario usuario = sesionUsuario.getUsuario();
        Instant accessExpiresAt = now.plus(jwtProperties.getAccessTokenTtl());
        RefreshTokenService.CreatedRefreshToken createdRefreshToken = refreshTokenService.create(sesionUsuario, now);
        String accessToken = jwtTokenService.createAccessToken(sesionUsuario, now, accessExpiresAt);
        SessionUserResponse user = new SessionUserResponse(
                String.valueOf(usuario.getIdUsuario()),
                usuario.getNombre(),
                usuario.getCorreo() != null ? usuario.getCorreo() : usuario.getNombreUsuario());
        return new TokenResponse(accessToken, createdRefreshToken.token(), accessExpiresAt,
                createdRefreshToken.expiresAt(), user);
    }
}
