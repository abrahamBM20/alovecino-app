package com.alovecino.geoservice.dto;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GeocodeResponse {

    private final BigDecimal latitud;
    private final BigDecimal longitud;

    @JsonProperty("direccion_formateada")
    private final String direccionFormateada;

    private final String source;

    public GeocodeResponse(BigDecimal latitud, BigDecimal longitud, String direccionFormateada, String source) {
        this.latitud = latitud;
        this.longitud = longitud;
        this.direccionFormateada = direccionFormateada;
        this.source = source;
    }

    public BigDecimal getLatitud() {
        return latitud;
    }

    public BigDecimal getLongitud() {
        return longitud;
    }

    public String getDireccionFormateada() {
        return direccionFormateada;
    }

    public String getSource() {
        return source;
    }
}
