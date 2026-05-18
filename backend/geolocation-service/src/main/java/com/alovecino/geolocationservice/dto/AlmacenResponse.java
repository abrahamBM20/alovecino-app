package com.alovecino.geolocationservice.dto;

public class AlmacenResponse {

    private Long idAlmacen;
    private String nombre;
    private Long usuarioId;
    private String estadoCuenta;
    private DireccionResponse direccion;

    public AlmacenResponse() {
    }

    public AlmacenResponse(Long idAlmacen, String nombre, Long usuarioId, String estadoCuenta,
            DireccionResponse direccion) {
        this.idAlmacen = idAlmacen;
        this.nombre = nombre;
        this.usuarioId = usuarioId;
        this.estadoCuenta = estadoCuenta;
        this.direccion = direccion;
    }

    public static AlmacenResponse fromEntity(com.alovecino.geolocationservice.model.Almacen almacen) {
        var direccion = almacen.getDireccion();
        var comuna = direccion.getComuna();
        var region = comuna.getRegion();
        return new AlmacenResponse(
                almacen.getIdAlmacen(),
                almacen.getNombre(),
                almacen.getUsuario().getIdUsuario(),
                almacen.getEstadoCuenta().getCodigo(),
                new DireccionResponse(
                        direccion.getCalle(),
                        direccion.getNumero(),
                        comuna.getNombre(),
                        region.getNombre(),
                        direccion.getCodigoPostal(),
                        direccion.getLatitud(),
                        direccion.getLongitud()));
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

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getEstadoCuenta() {
        return estadoCuenta;
    }

    public void setEstadoCuenta(String estadoCuenta) {
        this.estadoCuenta = estadoCuenta;
    }

    public DireccionResponse getDireccion() {
        return direccion;
    }

    public void setDireccion(DireccionResponse direccion) {
        this.direccion = direccion;
    }
}
