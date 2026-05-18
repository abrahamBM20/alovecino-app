package com.alovecino.geolocationservice.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "geocode_audit")
public class GeocodeAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_geocode_audit")
    private Long idGeocodeAudit;

    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario;

    @Column(nullable = false, length = 500)
    private String direccion;

    @Column(name = "fecha_llamada")
    private LocalDateTime fechaLlamada;

    @Column(length = 20)
    private String resultado;

    public GeocodeAudit() {
    }

    public GeocodeAudit(Long idUsuario, String direccion, String resultado) {
        this.idUsuario = idUsuario;
        this.direccion = direccion;
        this.resultado = resultado;
    }

    @PrePersist
    protected void onCreate() {
        if (this.fechaLlamada == null) {
            this.fechaLlamada = LocalDateTime.now();
        }
    }

    public Long getIdGeocodeAudit() {
        return idGeocodeAudit;
    }

    public void setIdGeocodeAudit(Long idGeocodeAudit) {
        this.idGeocodeAudit = idGeocodeAudit;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public LocalDateTime getFechaLlamada() {
        return fechaLlamada;
    }

    public void setFechaLlamada(LocalDateTime fechaLlamada) {
        this.fechaLlamada = fechaLlamada;
    }

    public String getResultado() {
        return resultado;
    }

    public void setResultado(String resultado) {
        this.resultado = resultado;
    }
}
