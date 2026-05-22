package com.alovecino.usuarioservice.dto;

import java.util.List;

public class UsuarioProfileResponse {

    private Long idUsuario;
    private String uuid;
    private String rut;
    private String nombreUsuario;
    private String nombre;
    private String correo;
    private String nombreRol;
    private String fotoPerfil;
    private ClienteProfileResponse cliente;
    private List<AlmacenProfileResponse> almacenes;

    public UsuarioProfileResponse() {
    }

    public UsuarioProfileResponse(Long idUsuario, String uuid, String rut, String nombreUsuario, String nombre,
            String correo, String nombreRol, String fotoPerfil, ClienteProfileResponse cliente,
            List<AlmacenProfileResponse> almacenes) {
        this.idUsuario = idUsuario;
        this.uuid = uuid;
        this.rut = rut;
        this.nombreUsuario = nombreUsuario;
        this.nombre = nombre;
        this.correo = correo;
        this.nombreRol = nombreRol;
        this.fotoPerfil = fotoPerfil;
        this.cliente = cliente;
        this.almacenes = almacenes;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
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

    public String getFotoPerfil() {
        return fotoPerfil;
    }

    public void setFotoPerfil(String fotoPerfil) {
        this.fotoPerfil = fotoPerfil;
    }

    public ClienteProfileResponse getCliente() {
        return cliente;
    }

    public void setCliente(ClienteProfileResponse cliente) {
        this.cliente = cliente;
    }

    public List<AlmacenProfileResponse> getAlmacenes() {
        return almacenes;
    }

    public void setAlmacenes(List<AlmacenProfileResponse> almacenes) {
        this.almacenes = almacenes;
    }
}
