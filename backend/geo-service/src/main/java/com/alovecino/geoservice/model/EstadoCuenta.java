package com.alovecino.geoservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "estado_cuenta")
public class EstadoCuenta {

    @Id
    @Column(name = "id_estado_cuenta")
    private Long idEstadoCuenta;

    @Column(name = "codigo", nullable = false, length = 40)
    private String codigo;

    public Long getIdEstadoCuenta() {
        return idEstadoCuenta;
    }

    public void setIdEstadoCuenta(Long idEstadoCuenta) {
        this.idEstadoCuenta = idEstadoCuenta;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }
}
