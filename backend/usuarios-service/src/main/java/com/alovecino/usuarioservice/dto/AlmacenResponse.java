package com.alovecino.usuarioservice.dto;

public class AlmacenResponse {

    private String uuid;
    private String nombre;
    private String direccion;
    private String comuna;
    private String telefono;
    private String estado;
    private String duenoUuid;

    public AlmacenResponse() {
    }

    public AlmacenResponse(String uuid, String nombre, String direccion, String comuna, String telefono,
            String estado, String duenoUuid) {
        this.uuid = uuid;
        this.nombre = nombre;
        this.direccion = direccion;
        this.comuna = comuna;
        this.telefono = telefono;
        this.estado = estado;
        this.duenoUuid = duenoUuid;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getComuna() {
        return comuna;
    }

    public void setComuna(String comuna) {
        this.comuna = comuna;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getDuenoUuid() {
        return duenoUuid;
    }

    public void setDuenoUuid(String duenoUuid) {
        this.duenoUuid = duenoUuid;
    }
}
