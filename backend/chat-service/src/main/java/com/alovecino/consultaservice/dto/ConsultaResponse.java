package com.alovecino.consultaservice.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ConsultaResponse {

    private Long idConsulta;
    private String descripcion;
    private Integer cantidad;
    private Long idCliente;
    private Long idAlmacen;
    private LocalDateTime fechaRespuesta;
    private String respuesta;
    private Long idEstadoConsulta;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}