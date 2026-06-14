package com.alovecino.consultaservice.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ConsultaDetalleResponse {

    private Long idConsultaDetalle;
    private String descripcion;
    private Integer cantidadSolicitada;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
