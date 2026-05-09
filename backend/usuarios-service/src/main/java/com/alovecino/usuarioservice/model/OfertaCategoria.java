package com.alovecino.usuarioservice.model;

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
@Table(name = "oferta_categoria", uniqueConstraints = @UniqueConstraint(name = "uk_oferta_categoria", columnNames = {
        "id_oferta", "id_categoria_almacen" }))
public class OfertaCategoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idOfertaCategoria;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_oferta", nullable = false)
    private Oferta oferta;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_categoria_almacen", nullable = false)
    private CategoriaAlmacen categoriaAlmacen;
}
