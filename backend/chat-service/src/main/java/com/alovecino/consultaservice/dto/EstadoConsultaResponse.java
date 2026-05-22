package com.alovecino.consultaservice.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EstadoConsultaResponse {

    private Long idEstadoConsulta;
    private String nombre;
    private String descripcion;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}