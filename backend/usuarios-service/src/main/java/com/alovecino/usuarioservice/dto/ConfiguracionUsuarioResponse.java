package com.alovecino.usuarioservice.dto;

import java.math.BigDecimal;

import com.alovecino.usuarioservice.model.ConfiguracionUsuario;

public class ConfiguracionUsuarioResponse {

    private Long idConfiguracionUsuario;
    private Long idUsuario;
    private boolean notificacionesPush;
    private boolean notificacionesEmail;
    private boolean recibirOfertas;
    private boolean perfilVisible;
    private BigDecimal radioOfertasKm;

    public ConfiguracionUsuarioResponse() {
    }

    public ConfiguracionUsuarioResponse(Long idConfiguracionUsuario, Long idUsuario, boolean notificacionesPush,
            boolean notificacionesEmail, boolean recibirOfertas, boolean perfilVisible, BigDecimal radioOfertasKm) {
        this.idConfiguracionUsuario = idConfiguracionUsuario;
        this.idUsuario = idUsuario;
        this.notificacionesPush = notificacionesPush;
        this.notificacionesEmail = notificacionesEmail;
        this.recibirOfertas = recibirOfertas;
        this.perfilVisible = perfilVisible;
        this.radioOfertasKm = radioOfertasKm;
    }

    public static ConfiguracionUsuarioResponse fromEntity(ConfiguracionUsuario configuracion) {
        return new ConfiguracionUsuarioResponse(
                configuracion.getIdConfiguracionUsuario(),
                configuracion.getUsuario().getIdUsuario(),
                configuracion.isNotificacionesPush(),
                configuracion.isNotificacionesEmail(),
                configuracion.isRecibirOfertas(),
                configuracion.isPerfilVisible(),
                configuracion.getRadioOfertasKm());
    }

    public Long getIdConfiguracionUsuario() {
        return idConfiguracionUsuario;
    }

    public void setIdConfiguracionUsuario(Long idConfiguracionUsuario) {
        this.idConfiguracionUsuario = idConfiguracionUsuario;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public boolean isNotificacionesPush() {
        return notificacionesPush;
    }

    public void setNotificacionesPush(boolean notificacionesPush) {
        this.notificacionesPush = notificacionesPush;
    }

    public boolean isNotificacionesEmail() {
        return notificacionesEmail;
    }

    public void setNotificacionesEmail(boolean notificacionesEmail) {
        this.notificacionesEmail = notificacionesEmail;
    }

    public boolean isRecibirOfertas() {
        return recibirOfertas;
    }

    public void setRecibirOfertas(boolean recibirOfertas) {
        this.recibirOfertas = recibirOfertas;
    }

    public boolean isPerfilVisible() {
        return perfilVisible;
    }

    public void setPerfilVisible(boolean perfilVisible) {
        this.perfilVisible = perfilVisible;
    }

    public BigDecimal getRadioOfertasKm() {
        return radioOfertasKm;
    }

    public void setRadioOfertasKm(BigDecimal radioOfertasKm) {
        this.radioOfertasKm = radioOfertasKm;
    }
}
