package com.alovecino.geolocationservice.dto;

import java.math.BigDecimal;

public class CoordinatesResponse {

    private BigDecimal latitud;
    private BigDecimal longitud;

    public CoordinatesResponse(BigDecimal latitud, BigDecimal longitud) {
        this.latitud = latitud;
        this.longitud = longitud;
    }

    public BigDecimal getLatitud() {
        return latitud;
    }

    public void setLatitud(BigDecimal latitud) {
        this.latitud = latitud;
    }

    public BigDecimal getLongitud() {
        return longitud;
    }

    public void setLongitud(BigDecimal longitud) {
        this.longitud = longitud;
    }
}
