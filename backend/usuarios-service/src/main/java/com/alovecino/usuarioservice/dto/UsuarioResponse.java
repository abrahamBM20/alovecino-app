package com.alovecino.usuarioservice.dto;

public class UsuarioResponse {

    private String uuid;
    private String nombreUsuario;
    private String nombreRol;

    public UsuarioResponse() {
    }

    public UsuarioResponse(String uuid, String nombreUsuario, String nombreRol) {
        this.uuid = uuid;
        this.nombreUsuario = nombreUsuario;
        this.nombreRol = nombreRol;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }

    public String getNombreRol() {
        return nombreRol;
    }

    public void setNombreRol(String nombreRol) {
        this.nombreRol = nombreRol;
    }
}

