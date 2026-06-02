package com.alovecino.usuarioservice.dto;

import java.time.LocalDate;

public class ClienteProfileResponse {

    private Long idCliente;
    private LocalDate fechaNacimiento;
    private EstadoCuentaResponse estadoCuenta;
    private DireccionResponse direccion;

    public ClienteProfileResponse() {
    }

    public ClienteProfileResponse(Long idCliente, LocalDate fechaNacimiento, EstadoCuentaResponse estadoCuenta,
            DireccionResponse direccion) {
        this.idCliente = idCliente;
        this.fechaNacimiento = fechaNacimiento;
        this.estadoCuenta = estadoCuenta;
        this.direccion = direccion;
    }

    public Long getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Long idCliente) {
        this.idCliente = idCliente;
    }

    public LocalDate getFechaNacimiento() {
        return fechaNacimiento;
    }

    public void setFechaNacimiento(LocalDate fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
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
