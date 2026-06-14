package com.alovecino.consultaservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class DashboardAlmacenResponse {

    private Long idAlmacen;
    private long totalConsultas;
    private long consultasHoy;
    private long pendientes;
    private long respondidas;
    private long cerradas;
    private Long tiempoPromedioMin;
    private List<ConsultaResponse> consultasRecientes;
}
