package com.alovecino.usuarioservice.dto;

public class AlmacenResponse {

    private Long idAlmacen;
    private String nombre;
    private String calle;
    private String numero;
    private String codigoPostal;
    private String comuna;
    private String region;
    private String latitud;
    private String longitud;
    private String estado;
    private Long idDueno;
    private String imagenUrl;
    private String telefono;

    public AlmacenResponse() {
    }

    public AlmacenResponse(Long idAlmacen, String nombre, String calle, String numero, String comuna, String region,
            String latitud, String longitud, String estado, Long idDueno, String imagenUrl) {
        this(idAlmacen, nombre, calle, numero, null, comuna, region, latitud, longitud, estado, idDueno, imagenUrl,
                null);
    }

    public AlmacenResponse(Long idAlmacen, String nombre, String calle, String numero, String comuna, String region,
            String latitud, String longitud, String estado, Long idDueno, String imagenUrl, String telefono) {
        this(idAlmacen, nombre, calle, numero, null, comuna, region, latitud, longitud, estado, idDueno, imagenUrl,
                telefono);
    }

    public AlmacenResponse(Long idAlmacen, String nombre, String calle, String numero, String codigoPostal,
            String comuna, String region, String latitud, String longitud, String estado, Long idDueno,
            String imagenUrl, String telefono) {
        this.idAlmacen = idAlmacen;
        this.nombre = nombre;
        this.calle = calle;
        this.numero = numero;
        this.codigoPostal = codigoPostal;
        this.comuna = comuna;
        this.region = region;
        this.latitud = latitud;
        this.longitud = longitud;
        this.estado = estado;
        this.idDueno = idDueno;
        this.imagenUrl = imagenUrl;
        this.telefono = telefono;
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

    public String getCodigoPostal() {
        return codigoPostal;
    }

    public void setCodigoPostal(String codigoPostal) {
        this.codigoPostal = codigoPostal;
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

    public String getLatitud() {
        return latitud;
    }

    public void setLatitud(String latitud) {
        this.latitud = latitud;
    }

    public String getLongitud() {
        return longitud;
    }

    public void setLongitud(String longitud) {
        this.longitud = longitud;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Long getIdDueno() {
        return idDueno;
    }

    public void setIdDueno(Long idDueno) {
        this.idDueno = idDueno;
    }

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }
}
