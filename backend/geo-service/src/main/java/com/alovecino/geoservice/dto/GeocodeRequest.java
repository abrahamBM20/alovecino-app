package com.alovecino.geoservice.dto;

import jakarta.validation.constraints.NotBlank;

public class GeocodeRequest {

    @NotBlank(message = "calle es obligatoria")
    private String calle;

    @NotBlank(message = "numero es obligatorio")
    private String numero;

    @NotBlank(message = "comuna es obligatoria")
    private String comuna;

    @NotBlank(message = "region es obligatoria")
    private String region;

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

    public String toAddressLine() {
        return String.join(", ", calle + " " + numero, comuna, region, "Chile");
    }
}
