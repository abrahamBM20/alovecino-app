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
@Table(name = "almacen_categoria", uniqueConstraints = @UniqueConstraint(name = "uk_almacen_categoria", columnNames = {
        "id_almacen", "id_categoria_almacen" }))
public class AlmacenCategoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAlmacenCategoria;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_almacen", nullable = false)
    private Almacen almacen;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_categoria_almacen", nullable = false)
    private CategoriaAlmacen categoriaAlmacen;
}
