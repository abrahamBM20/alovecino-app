package com.alovecino.geolocationservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CrearAlmacenRequest {

    @NotBlank(message = "El nombre del almacén es obligatorio")
    private String nombre;

    @NotNull(message = "El id del usuario es obligatorio")
    private Long usuarioId;

    @Valid
    @NotNull(message = "La dirección es obligatoria")
    private DireccionRequest direccion;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public DireccionRequest getDireccion() {
        return direccion;
    }

    public void setDireccion(DireccionRequest direccion) {
        this.direccion = direccion;
    }
}
