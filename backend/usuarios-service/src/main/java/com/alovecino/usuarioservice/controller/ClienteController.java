package com.alovecino.usuarioservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.alovecino.usuarioservice.dto.ClienteResponse;
import com.alovecino.usuarioservice.service.ClienteService;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponse> getClienteById(@PathVariable("id") Long idCliente) {
        return ResponseEntity.ok(clienteService.getClienteById(idCliente));
    }
}
