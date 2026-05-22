package com.alovecino.consultaservice.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Data
public class ResponderConsultaRequest {

    @NotBlank(message = "La respuesta es obligatoria")
    private String respuesta;

    @NotNull(message = "El ID del estado de consulta es obligatorio")
    @Positive(message = "El ID del estado de consulta debe ser mayor a 0")
    private Long idEstadoConsulta;
}
