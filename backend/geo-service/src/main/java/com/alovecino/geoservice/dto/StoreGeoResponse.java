package com.alovecino.geoservice.dto;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

public class StoreGeoResponse {

    @JsonProperty("id_almacen")
    private final Long idAlmacen;

    private final String nombre;
    private final BigDecimal latitud;
    private final BigDecimal longitud;

    @JsonProperty("distancia_metros")
    private final long distanciaMetros;

    @JsonProperty("distancia_km")
    private final BigDecimal distanciaKm;

    private final String comuna;
    private final String region;

    public StoreGeoResponse(Long idAlmacen, String nombre, BigDecimal latitud, BigDecimal longitud,
            long distanciaMetros, BigDecimal distanciaKm, String comuna, String region) {
        this.idAlmacen = idAlmacen;
        this.nombre = nombre;
        this.latitud = latitud;
        this.longitud = longitud;
        this.distanciaMetros = distanciaMetros;
        this.distanciaKm = distanciaKm;
        this.comuna = comuna;
        this.region = region;
    }

    public Long getIdAlmacen() {
        return idAlmacen;
    }

    public String getNombre() {
        return nombre;
    }

    public BigDecimal getLatitud() {
        return latitud;
    }

    public BigDecimal getLongitud() {
        return longitud;
    }

    public long getDistanciaMetros() {
        return distanciaMetros;
    }

    public BigDecimal getDistanciaKm() {
        return distanciaKm;
    }

    public String getComuna() {
        return comuna;
    }

    public String getRegion() {
        return region;
    }
}
