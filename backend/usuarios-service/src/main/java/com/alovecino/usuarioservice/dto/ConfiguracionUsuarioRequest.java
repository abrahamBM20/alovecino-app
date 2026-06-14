package com.alovecino.usuarioservice.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

public class ConfiguracionUsuarioRequest {

    @NotNull(message = "La preferencia de notificaciones push es obligatoria")
    private Boolean notificacionesPush;

    @NotNull(message = "La preferencia de notificaciones email es obligatoria")
    private Boolean notificacionesEmail;

    @NotNull(message = "La preferencia de ofertas es obligatoria")
    private Boolean recibirOfertas;

    @NotNull(message = "La preferencia de visibilidad de perfil es obligatoria")
    private Boolean perfilVisible;

    @NotNull(message = "El radio de ofertas es obligatorio")
    @DecimalMin(value = "0.5", message = "El radio de ofertas debe ser al menos 0.5 km")
    @DecimalMax(value = "10.0", message = "El radio de ofertas no puede superar 10 km")
    @Digits(integer = 4, fraction = 2, message = "El radio de ofertas debe tener máximo 2 decimales")
    private BigDecimal radioOfertasKm;

    public Boolean getNotificacionesPush() {
        return notificacionesPush;
    }

    public void setNotificacionesPush(Boolean notificacionesPush) {
        this.notificacionesPush = notificacionesPush;
    }

    public Boolean getNotificacionesEmail() {
        return notificacionesEmail;
    }

    public void setNotificacionesEmail(Boolean notificacionesEmail) {
        this.notificacionesEmail = notificacionesEmail;
    }

    public Boolean getRecibirOfertas() {
        return recibirOfertas;
    }

    public void setRecibirOfertas(Boolean recibirOfertas) {
        this.recibirOfertas = recibirOfertas;
    }

    public Boolean getPerfilVisible() {
        return perfilVisible;
    }

    public void setPerfilVisible(Boolean perfilVisible) {
        this.perfilVisible = perfilVisible;
    }

    public BigDecimal getRadioOfertasKm() {
        return radioOfertasKm;
    }

    public void setRadioOfertasKm(BigDecimal radioOfertasKm) {
        this.radioOfertasKm = radioOfertasKm;
    }
}
