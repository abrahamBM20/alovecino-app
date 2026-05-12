package main.java.com.alovecino.consultaservice.model;

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
    @Column(name = "id_configuracion")
    private Long idConfiguracion;

    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario;

    @Column(name = "notificaciones_email", nullable = false)
    private Boolean notificacionesEmail = true;

    @Column(name = "notificaciones_push", nullable = false)
    private Boolean notificacionesPush = true;

    @Column(name = "idioma", length = 10)
    private String idioma = "es";

    @Column(name = "zona_horaria", length = 50)
    private String zonaHoraria = "America/Mexico_City";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
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
        if (idioma == null) {
            idioma = "es";
        }
        if (zonaHoraria == null) {
            zonaHoraria = "America/Mexico_City";
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}