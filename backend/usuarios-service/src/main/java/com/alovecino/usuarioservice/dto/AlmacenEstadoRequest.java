package com.alovecino.usuarioservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AlmacenEstadoRequest {

    @NotBlank(message = "El estado es obligatorio")
    @Size(max = 40, message = "El estado no puede superar 40 caracteres")
    private String estado;

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
