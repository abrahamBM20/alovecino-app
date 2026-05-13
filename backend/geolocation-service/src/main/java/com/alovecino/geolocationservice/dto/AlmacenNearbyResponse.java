package com.alovecino.geolocationservice.dto;

import java.math.BigDecimal;

import com.alovecino.geolocationservice.repository.AlmacenRepository;

public class AlmacenNearbyResponse {

    private Long idAlmacen;
    private String nombre;
    private String calle;
    private String numero;
    private String comuna;
    private String region;
    private BigDecimal latitud;
    private BigDecimal longitud;
    private Double distanciaKm;

    public AlmacenNearbyResponse() {
    }

    public AlmacenNearbyResponse(Long idAlmacen, String nombre, String calle, String numero, String comuna,
            String region, BigDecimal latitud, BigDecimal longitud, Double distanciaKm) {
        this.idAlmacen = idAlmacen;
        this.nombre = nombre;
        this.calle = calle;
        this.numero = numero;
        this.comuna = comuna;
        this.region = region;
        this.latitud = latitud;
        this.longitud = longitud;
        this.distanciaKm = distanciaKm;
    }

    public static AlmacenNearbyResponse fromProjection(AlmacenRepository.AlmacenNearbyProjection projection) {
        return new AlmacenNearbyResponse(
                projection.getIdAlmacen(),
                projection.getNombre(),
                projection.getCalle(),
                projection.getNumero(),
                projection.getComuna(),
                projection.getRegion(),
                projection.getLatitud(),
                projection.getLongitud(),
                projection.getDistanciaKm());
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

    public BigDecimal getLatitud() {
        return latitud;
    }

    public void setLatitud(BigDecimal latitud) {
        this.latitud = latitud;
    }

    public BigDecimal getLongitud() {
        return longitud;
    }

    public void setLongitud(BigDecimal longitud) {
        this.longitud = longitud;
    }

    public Double getDistanciaKm() {
        return distanciaKm;
    }

    public void setDistanciaKm(Double distanciaKm) {
        this.distanciaKm = distanciaKm;
    }
}
