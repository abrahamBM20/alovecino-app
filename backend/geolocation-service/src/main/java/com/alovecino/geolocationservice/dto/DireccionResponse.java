package com.alovecino.geolocationservice.dto;

import java.math.BigDecimal;

public class DireccionResponse {

    private String calle;
    private String numero;
    private String comuna;
    private String region;
    private String codigoPostal;
    private BigDecimal latitud;
    private BigDecimal longitud;

    public DireccionResponse() {
    }

    public DireccionResponse(String calle, String numero, String comuna, String region, String codigoPostal,
            BigDecimal latitud, BigDecimal longitud) {
        this.calle = calle;
        this.numero = numero;
        this.comuna = comuna;
        this.region = region;
        this.codigoPostal = codigoPostal;
        this.latitud = latitud;
        this.longitud = longitud;
    }

    public String getCalle() {
        return calle;
    }

    public void setCalle(String calle) {
        this.calle = calle;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getComuna() {
        return comuna;
    }

    public void setComuna(String comuna) {
        this.comuna = comuna;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getCodigoPostal() {
        return codigoPostal;
    }

    public void setCodigoPostal(String codigoPostal) {
        this.codigoPostal = codigoPostal;
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
