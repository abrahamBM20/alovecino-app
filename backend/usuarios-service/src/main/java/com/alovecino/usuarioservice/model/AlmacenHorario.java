package com.alovecino.usuarioservice.model;

import java.time.LocalTime;

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
@Table(name = "almacen_horario", uniqueConstraints = @UniqueConstraint(name = "uk_almacen_horario_bloque", columnNames = {
        "id_almacen", "dia_semana", "hora_apertura", "hora_cierre" }))
public class AlmacenHorario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAlmacenHorario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_almacen", nullable = false)
    private Almacen almacen;

    @Column(name = "dia_semana", nullable = false)
    private Short diaSemana;

    @Column(name = "hora_apertura")
    private LocalTime horaApertura;

    @Column(name = "hora_cierre")
    private LocalTime horaCierre;

    @Column(name = "cerrado", nullable = false)
    private boolean cerrado;
}
