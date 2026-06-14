package com.alovecino.usuarioservice.model;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "configuracion_usuario")
public class ConfiguracionUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idConfiguracionUsuario;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "notificaciones_push", nullable = false)
    private boolean notificacionesPush = true;

    @Column(name = "notificaciones_email", nullable = false)
    private boolean notificacionesEmail = false;

    @Column(name = "recibir_ofertas", nullable = false)
    private boolean recibirOfertas = true;

    @Column(name = "perfil_visible", nullable = false)
    private boolean perfilVisible = true;

    @Column(name = "radio_ofertas_km", nullable = false, precision = 6, scale = 2)
    private BigDecimal radioOfertasKm = new BigDecimal("3.00");

    public Long getIdConfiguracionUsuario() {
        return idConfiguracionUsuario;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
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
