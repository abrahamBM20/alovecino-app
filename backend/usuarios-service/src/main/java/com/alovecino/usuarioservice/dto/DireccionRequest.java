package com.alovecino.usuarioservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class DireccionRequest {

    @NotBlank(message = "La calle es obligatoria")
    @Size(max = 160, message = "La calle no puede superar 160 caracteres")
    private String calle;

    @NotBlank(message = "El número es obligatorio")
    @Size(max = 30, message = "El número no puede superar 30 caracteres")
    private String numero;

    @NotBlank(message = "La comuna es obligatoria")
    @Size(max = 120, message = "La comuna no puede superar 120 caracteres")
    private String comuna;

    @NotBlank(message = "La región es obligatoria")
    @Size(max = 120, message = "La región no puede superar 120 caracteres")
    private String region;

    @Size(max = 20, message = "El código postal no puede superar 20 caracteres")
    private String codigoPostal;

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
}
