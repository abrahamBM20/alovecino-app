package com.alovecino.usuarioservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AlmacenRequest {

    @NotBlank(message = "El nombre del almacén es obligatorio")
    @Size(max = 120, message = "El nombre no puede superar 120 caracteres")
    private String nombre;

    @Valid
    @NotNull(message = "La dirección es obligatoria")
    private DireccionRequest direccion;

    @NotBlank(message = "El teléfono principal es obligatorio")
    @Size(max = 30, message = "El teléfono no puede superar 30 caracteres")
    private String telefono;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public DireccionRequest getDireccion() {
        return direccion;
    }

    public void setDireccion(DireccionRequest direccion) {
        this.direccion = direccion;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }
}
