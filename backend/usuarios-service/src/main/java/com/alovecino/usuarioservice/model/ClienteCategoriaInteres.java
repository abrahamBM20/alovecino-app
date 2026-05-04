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
@Table(name = "cliente_categoria_interes", uniqueConstraints = @UniqueConstraint(name = "uk_cliente_categoria_interes", columnNames = {
        "id_cliente", "id_categoria_almacen" }))
public class ClienteCategoriaInteres {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idClienteCategoriaInteres;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_categoria_almacen", nullable = false)
    private CategoriaAlmacen categoriaAlmacen;
}
