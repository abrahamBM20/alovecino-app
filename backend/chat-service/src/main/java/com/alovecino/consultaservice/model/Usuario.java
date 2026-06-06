package com.alovecino.consultaservice.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuario")
@Data
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "rut", nullable = false, unique = true, length = 12)
    private String rut;

    @Column(name = "nombre_usuario", nullable = false, unique = true, length = 120)
    private String nombreUsuario;

    @Column(name = "nombre", nullable = false, length = 160)
    private String nombre;

    @Column(name = "correo", nullable = false, unique = true, length = 180)
    private String correo;

    @Column(name = "contrasena", nullable = false, length = 255)
    private String contrasena;

    @Column(name = "id_rol", nullable = false)
    private Long idRol;

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
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
