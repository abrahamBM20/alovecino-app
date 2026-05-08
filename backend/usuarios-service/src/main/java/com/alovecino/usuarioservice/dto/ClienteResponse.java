package com.alovecino.usuarioservice.dto;

public class ClienteResponse {

    private Long idCliente;
    private String calle;
    private String numero;
    private String comuna;
    private String region;
    private String codigoPostal;
    private String latitud;
    private String longitud;

    public ClienteResponse() {
    }

    public ClienteResponse(Long idCliente, String calle, String numero, String comuna, String region,
            String codigoPostal, String latitud, String longitud) {
        this.idCliente = idCliente;
        this.calle = calle;
        this.numero = numero;
        this.comuna = comuna;
        this.region = region;
        this.codigoPostal = codigoPostal;
        this.latitud = latitud;
        this.longitud = longitud;
    }

    public Long getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Long idCliente) {
        this.idCliente = idCliente;
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

    public String getCodigoPostal() {
        return codigoPostal;
    }

    public void setCodigoPostal(String codigoPostal) {
        this.codigoPostal = codigoPostal;
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
}
