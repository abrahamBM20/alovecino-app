package com.alovecino.usuarioservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.alovecino.usuarioservice.dto.DireccionResponse;
import com.alovecino.usuarioservice.service.AlmacenService;
import com.alovecino.usuarioservice.service.ClienteService;

@RestController
@RequestMapping("/api/internal/geolocalizacion")
public class InternalGeolocationController {

    private final AlmacenService almacenService;
    private final ClienteService clienteService;

    public InternalGeolocationController(AlmacenService almacenService, ClienteService clienteService) {
        this.almacenService = almacenService;
        this.clienteService = clienteService;
    }

    @GetMapping("/almacenes/{id}")
    public ResponseEntity<DireccionResponse> getAlmacenAddress(@PathVariable("id") Long idAlmacen) {
        return ResponseEntity.ok(almacenService.getDireccionResponseById(idAlmacen));
    }

    @GetMapping("/clientes/{id}")
    public ResponseEntity<DireccionResponse> getClienteAddress(@PathVariable("id") Long idCliente) {
        return ResponseEntity.ok(clienteService.getDireccionResponseById(idCliente));
    }
}
