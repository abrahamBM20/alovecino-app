package com.alovecino.usuarioservice.dto;

public class UsuarioResponse {

    private Long idUsuario;
    private String rut;
    private String nombreUsuario;
    private String nombre;
    private String correo;
    private String nombreRol;

    public UsuarioResponse() {
    }

    public UsuarioResponse(Long idUsuario, String rut, String nombreUsuario, String nombre, String correo,
            String nombreRol) {
        this.idUsuario = idUsuario;
        this.rut = rut;
        this.nombreUsuario = nombreUsuario;
        this.nombre = nombre;
        this.correo = correo;
        this.nombreRol = nombreRol;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getRut() {
        return rut;
    }

    public void setRut(String rut) {
        this.rut = rut;
    }

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getNombreRol() {
        return nombreRol;
    }

    public void setNombreRol(String nombreRol) {
        this.nombreRol = nombreRol;
    }
}

