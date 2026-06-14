package com.alovecino.usuarioservice.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ValoracionUpdateRequest {

    @NotNull(message = "La cantidad de estrellas es obligatoria")
    @Min(value = 1, message = "La valoración mínima es 1 estrella")
    @Max(value = 5, message = "La valoración máxima es 5 estrellas")
    private Integer cantidadEstrellas;

    @Size(max = 1000, message = "El comentario no puede superar los 1000 caracteres")
    private String contenido;

    public Integer getCantidadEstrellas() { return cantidadEstrellas; }
    public void setCantidadEstrellas(Integer cantidadEstrellas) { this.cantidadEstrellas = cantidadEstrellas; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }
}
