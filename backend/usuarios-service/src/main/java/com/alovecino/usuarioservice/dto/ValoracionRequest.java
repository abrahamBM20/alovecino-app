package com.alovecino.usuarioservice.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ValoracionRequest {

    @NotNull(message = "La cantidad de estrellas es obligatoria")
    @Min(value = 1, message = "La valoración mínima es 1 estrella")
    @Max(value = 5, message = "La valoración máxima es 5 estrellas")
    private Integer cantidadEstrellas;

    @Size(max = 1000, message = "El contenido no puede superar 1000 caracteres")
    private String contenido;

    @NotNull(message = "El almacén es obligatorio")
    private Long idAlmacen;

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

    public Long getIdAlmacen() {
        return idAlmacen;
    }

    public void setIdAlmacen(Long idAlmacen) {
        this.idAlmacen = idAlmacen;
    }
}
