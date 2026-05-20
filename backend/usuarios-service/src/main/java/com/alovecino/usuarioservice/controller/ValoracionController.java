package com.alovecino.usuarioservice.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.alovecino.usuarioservice.dto.ValoracionRequest;
import com.alovecino.usuarioservice.dto.ValoracionResponse;
import com.alovecino.usuarioservice.dto.ValoracionUpdateRequest;
import com.alovecino.usuarioservice.service.ValoracionService;

@RestController
@RequestMapping("/api/valoraciones")
public class ValoracionController {

    private final ValoracionService valoracionService;

    public ValoracionController(ValoracionService valoracionService) {
        this.valoracionService = valoracionService;
    }

    @PostMapping
    public ResponseEntity<ValoracionResponse> createValoracion(@AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ValoracionRequest request) {
        ValoracionResponse response = valoracionService.createValoracion(jwt.getSubject(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/almacen/{idAlmacen}")
    public List<ValoracionResponse> listByAlmacen(@PathVariable Long idAlmacen) {
        return valoracionService.listByAlmacen(idAlmacen);
    }

    @GetMapping("/mis-valoraciones")
    public List<ValoracionResponse> listMisValoraciones(@AuthenticationPrincipal Jwt jwt) {
        return valoracionService.listMisValoraciones(jwt.getSubject());
    }

    @PutMapping("/{idValoracion}")
    public ValoracionResponse updateValoracion(@AuthenticationPrincipal Jwt jwt,
            @PathVariable Long idValoracion,
            @Valid @RequestBody ValoracionUpdateRequest request) {
        return valoracionService.updateValoracion(jwt.getSubject(), idValoracion, request);
    }

    @DeleteMapping("/{idValoracion}")
    public ResponseEntity<Void> deleteValoracion(@AuthenticationPrincipal Jwt jwt,
            @PathVariable Long idValoracion) {
        valoracionService.deleteValoracion(jwt.getSubject(), idValoracion);
        return ResponseEntity.noContent().build();
    }
}
