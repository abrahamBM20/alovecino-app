package com.alovecino.usuarioservice.dto;

public class AlmacenProfileResponse {

    private Long idAlmacen;
    private String nombre;
    private EstadoCuentaResponse estadoCuenta;
    private DireccionResponse direccion;

    public AlmacenProfileResponse() {
    }

    public AlmacenProfileResponse(Long idAlmacen, String nombre, EstadoCuentaResponse estadoCuenta,
            DireccionResponse direccion) {
        this.idAlmacen = idAlmacen;
        this.nombre = nombre;
        this.estadoCuenta = estadoCuenta;
        this.direccion = direccion;
    }

    public Long getIdAlmacen() {
        return idAlmacen;
    }

    public void setIdAlmacen(Long idAlmacen) {
        this.idAlmacen = idAlmacen;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public EstadoCuentaResponse getEstadoCuenta() {
        return estadoCuenta;
    }

    public void setEstadoCuenta(EstadoCuentaResponse estadoCuenta) {
        this.estadoCuenta = estadoCuenta;
    }

    public DireccionResponse getDireccion() {
        return direccion;
    }

    public void setDireccion(DireccionResponse direccion) {
        this.direccion = direccion;
    }
}
