package com.alovecino.consultaservice.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ConsultaResponse {

    private Long idConsulta;
    private Long idCliente;
    private String clienteNombre;
    private Long idAlmacen;
    private LocalDateTime fechaRespuesta;
    private String respuesta;
    private Long idEstadoConsulta;
    private String estadoNombre;
    private List<ConsultaDetalleResponse> detalles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
