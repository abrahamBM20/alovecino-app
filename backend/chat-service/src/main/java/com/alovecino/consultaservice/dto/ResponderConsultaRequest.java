package com.alovecino.consultaservice.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

@Data
public class ResponderConsultaRequest {

    @NotBlank(message = "La respuesta es obligatoria")
    private String respuesta;

    @Positive(message = "El ID del estado de consulta debe ser mayor a 0")
    private Long idEstadoConsulta;
}
