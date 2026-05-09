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

@Entity
@Table(name = "almacen_imagen")
public class AlmacenImagen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAlmacenImagen;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_almacen", nullable = false)
    private Almacen almacen;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_tipo_imagen", nullable = false)
    private TipoImagen tipoImagen;

    @Column(name = "url", nullable = false, length = 500)
    private String url;

    @Column(name = "orden", nullable = false)
    private Integer orden = 0;
}
