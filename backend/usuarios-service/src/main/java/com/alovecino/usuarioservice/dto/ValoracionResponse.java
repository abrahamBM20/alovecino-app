package com.alovecino.usuarioservice.dto;

import java.time.OffsetDateTime;

public class ValoracionResponse {

    private Long idValoracion;
    private Integer cantidadEstrellas;
    private String contenido;
    private Long idCliente;
    private Long idAlmacen;
    private OffsetDateTime fechaCreacion;
    private OffsetDateTime fechaActualizacion;

    public ValoracionResponse() {
    }

    public ValoracionResponse(Long idValoracion, Integer cantidadEstrellas, String contenido,
            Long idCliente, Long idAlmacen, OffsetDateTime fechaCreacion, OffsetDateTime fechaActualizacion) {
        this.idValoracion = idValoracion;
        this.cantidadEstrellas = cantidadEstrellas;
        this.contenido = contenido;
        this.idCliente = idCliente;
        this.idAlmacen = idAlmacen;
        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
    }

    public Long getIdValoracion() {
        return idValoracion;
    }

    public void setIdValoracion(Long idValoracion) {
        this.idValoracion = idValoracion;
    }

    public Integer getCantidadEstrellas() {
        return cantidadEstrellas;
    }

    public void setCantidadEstrellas(Integer cantidadEstrellas) {
        this.cantidadEstrellas = cantidadEstrellas;
    }

    public String getContenido() {
        return contenido;
    }

    public void setContenido(String contenido) {
        this.contenido = contenido;
    }

    public Long getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Long idCliente) {
        this.idCliente = idCliente;
    }

    public Long getIdAlmacen() {
        return idAlmacen;
    }

    public void setIdAlmacen(Long idAlmacen) {
        this.idAlmacen = idAlmacen;
    }

    public OffsetDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(OffsetDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public OffsetDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(OffsetDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }
}
