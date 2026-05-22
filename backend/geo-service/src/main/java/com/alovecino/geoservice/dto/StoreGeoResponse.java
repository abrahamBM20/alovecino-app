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

    private final String calle;
    private final String numero;
    private final String comuna;
    private final String region;
    private final String direccion;

    public StoreGeoResponse(Long idAlmacen, String nombre, BigDecimal latitud, BigDecimal longitud,
            long distanciaMetros, BigDecimal distanciaKm, String calle, String numero, String comuna, String region) {
        this.idAlmacen = idAlmacen;
        this.nombre = nombre;
        this.latitud = latitud;
        this.longitud = longitud;
        this.distanciaMetros = distanciaMetros;
        this.distanciaKm = distanciaKm;
        this.calle = calle;
        this.numero = numero;
        this.comuna = comuna;
        this.region = region;
        this.direccion = formatDireccion(calle, numero, comuna, region);
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

    public String getCalle() {
        return calle;
    }

    public String getNumero() {
        return numero;
    }

    public String getComuna() {
        return comuna;
    }

    public String getRegion() {
        return region;
    }

    public String getDireccion() {
        return direccion;
    }

    private static String formatDireccion(String calle, String numero, String comuna, String region) {
        return String.join(", ", java.util.stream.Stream.of(
                joinStreet(calle, numero),
                comuna,
                region)
                .filter(value -> value != null && !value.isBlank())
                .toList());
    }

    private static String joinStreet(String calle, String numero) {
        if (calle == null || calle.isBlank()) {
            return numero;
        }
        if (numero == null || numero.isBlank()) {
            return calle;
        }
        return calle + " " + numero;
    }
}
