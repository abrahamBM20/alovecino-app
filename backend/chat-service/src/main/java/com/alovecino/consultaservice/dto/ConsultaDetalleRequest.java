package com.alovecino.consultaservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ConsultaDetalleRequest {

    @NotBlank(message = "La descripción del detalle es obligatoria")
    @Size(max = 1000, message = "La descripción del detalle no puede exceder 1000 caracteres")
    private String descripcion;

    @NotNull(message = "La cantidad solicitada es obligatoria")
    @Min(value = 1, message = "La cantidad solicitada debe ser mayor a 0")
    private Integer cantidadSolicitada;
}
