package com.alovecino.consultaservice.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "configuracion_usuario")
@Data
public class ConfiguracionUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_configuracion_usuario")
    private Long idConfiguracionUsuario;

    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario;

    @Column(name = "notificaciones_email", nullable = false)
    private Boolean notificacionesEmail = true;

    @Column(name = "notificaciones_push", nullable = false)
    private Boolean notificacionesPush = true;

    @Column(name = "recibir_ofertas", nullable = false)
    private Boolean recibirOfertas = true;

    @Column(name = "perfil_visible", nullable = false)
    private Boolean perfilVisible = true;

    @Column(name = "radio_ofertas_km", nullable = false)
    private java.math.BigDecimal radioOfertasKm = java.math.BigDecimal.valueOf(3.00);

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "fecha_actualizacion")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (notificacionesEmail == null) {
            notificacionesEmail = true;
        }
        if (notificacionesPush == null) {
            notificacionesPush = true;
        }
        if (recibirOfertas == null) {
            recibirOfertas = true;
        }
        if (perfilVisible == null) {
            perfilVisible = true;
        }
        if (radioOfertasKm == null) {
            radioOfertasKm = java.math.BigDecimal.valueOf(3.00);
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
