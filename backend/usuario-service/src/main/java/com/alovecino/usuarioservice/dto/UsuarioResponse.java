package com.alovecino.usuarioservice.dto;

public class UsuarioResponse {

    private Long idUsuario;
    private String nombreUsuario;
    private String nombreRol;

    public UsuarioResponse() {
    }

    public UsuarioResponse(Long idUsuario, String nombreUsuario, String nombreRol) {
        this.idUsuario = idUsuario;
        this.nombreUsuario = nombreUsuario;
        this.nombreRol = nombreRol;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
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
