package com.alovecino.consultaservice.model;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Data;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;

@Entity
@Table(name = "consulta")
@Data
public class Consulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_consulta")
    private Long idConsulta;

    @Column(name = "id_cliente")
    private Long idCliente;

    @Column(name = "id_almacen")
    private Long idAlmacen;

    @Column(name = "fecha_respuesta")
    private LocalDateTime fechaRespuesta;

    @Column(name = "respuesta", columnDefinition = "TEXT")
    private String respuesta;

    @Column(name = "id_estado_consulta", nullable = false)
    private Long idEstadoConsulta;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "fecha_actualizacion")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "consulta", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<ConsultaDetalle> detalles = new ArrayList<>();

    public void addDetalle(ConsultaDetalle detalle) {
        detalles.add(detalle);
        detalle.setConsulta(this);
    }

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
