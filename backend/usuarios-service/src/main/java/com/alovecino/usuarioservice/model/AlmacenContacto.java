package com.alovecino.usuarioservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "almacen_contacto", uniqueConstraints = @UniqueConstraint(name = "uk_almacen_contacto_valor", columnNames = {
        "id_almacen", "id_tipo_contacto", "valor" }))
public class AlmacenContacto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAlmacenContacto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_almacen", nullable = false)
    private Almacen almacen;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_tipo_contacto", nullable = false)
    private TipoContacto tipoContacto;

    @Column(name = "valor", nullable = false, length = 180)
    private String valor;

    @Column(name = "nombre_contacto", length = 120)
    private String nombreContacto;

    @Column(name = "es_principal", nullable = false)
    private boolean esPrincipal;

    public void setAlmacen(Almacen almacen) {
        this.almacen = almacen;
    }

    public Almacen getAlmacen() {
        return almacen;
    }

    public void setTipoContacto(TipoContacto tipoContacto) {
        this.tipoContacto = tipoContacto;
    }

    public TipoContacto getTipoContacto() {
        return tipoContacto;
    }

    public void setValor(String valor) {
        this.valor = valor;
    }

    public String getValor() {
        return valor;
    }

    public void setNombreContacto(String nombreContacto) {
        this.nombreContacto = nombreContacto;
    }

    public String getNombreContacto() {
        return nombreContacto;
    }

    public void setEsPrincipal(boolean esPrincipal) {
        this.esPrincipal = esPrincipal;
    }

    public boolean isEsPrincipal() {
        return esPrincipal;
    }
}
