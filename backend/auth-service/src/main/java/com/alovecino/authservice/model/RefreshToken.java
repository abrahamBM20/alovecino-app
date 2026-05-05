package com.alovecino.authservice.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "refresh_token")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idRefreshToken;

    @Column(name = "hash_token", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "id_sesion_usuario", nullable = false)
    private SesionUsuario sesionUsuario;

    @Column(name = "fecha_creacion", nullable = false)
    private Instant createdAt;

    @Column(name = "fecha_expiracion", nullable = false)
    private Instant expiresAt;

    @Column(name = "fecha_revocacion")
    private Instant revokedAt;

    public Long getIdRefreshToken() {
        return idRefreshToken;
    }

    public void setIdRefreshToken(Long idRefreshToken) {
        this.idRefreshToken = idRefreshToken;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public void setTokenHash(String tokenHash) {
        this.tokenHash = tokenHash;
    }

    public SesionUsuario getSesionUsuario() {
        return sesionUsuario;
    }

    public void setSesionUsuario(SesionUsuario sesionUsuario) {
        this.sesionUsuario = sesionUsuario;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getRevokedAt() {
        return revokedAt;
    }

    public void setRevokedAt(Instant revokedAt) {
        this.revokedAt = revokedAt;
    }

    @PrePersist
    @PreUpdate
    void validateExpiration() {
        if (createdAt == null) {
            throw new IllegalStateException("fecha_creacion is required");
        }
        if (expiresAt == null) {
            throw new IllegalStateException("fecha_expiracion is required");
        }
        if (!expiresAt.isAfter(createdAt)) {
            throw new IllegalStateException("fecha_expiracion must be after fecha_creacion");
        }
    }
}
