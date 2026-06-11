package com.alovecino.usuarioservice.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.alovecino.usuarioservice.dto.AlmacenEstadoRequest;
import com.alovecino.usuarioservice.dto.AlmacenImagenRequest;
import com.alovecino.usuarioservice.dto.AlmacenRequest;
import com.alovecino.usuarioservice.dto.AlmacenResponse;
import com.alovecino.usuarioservice.service.AlmacenService;

@RestController
@RequestMapping("/api/almacenes")
public class AlmacenController {

    private final AlmacenService almacenService;

    public AlmacenController(AlmacenService almacenService) {
        this.almacenService = almacenService;
    }

    @PostMapping
    public ResponseEntity<AlmacenResponse> createAlmacen(@AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody AlmacenRequest request) {
        AlmacenResponse response = almacenService.createAlmacen(jwt.getSubject(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/mis-almacenes")
    public List<AlmacenResponse> listMisAlmacenes(@AuthenticationPrincipal Jwt jwt) {
        return almacenService.listAlmacenesByDueno(jwt.getSubject());
    }

    @GetMapping("/{id}")
    public AlmacenResponse getAlmacen(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return almacenService.getAlmacenByDueno(jwt.getSubject(), id);
    }

    @PatchMapping("/{id}")
    public AlmacenResponse updateAlmacen(@AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @Valid @RequestBody AlmacenRequest request) {
        return almacenService.updateAlmacen(jwt.getSubject(), id, request);
    }

    @PatchMapping("/{id}/estado")
    public AlmacenResponse updateEstado(@AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @Valid @RequestBody AlmacenEstadoRequest request) {
        return almacenService.updateEstadoAlmacen(jwt.getSubject(), id, request);
    }

    @PatchMapping("/{id}/geocodificacion")
    public AlmacenResponse refreshGeocoding(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return almacenService.refreshGeocoding(jwt.getSubject(), id);
    }

    @PatchMapping("/geocodificacion")
    public List<AlmacenResponse> refreshAllGeocoding(@AuthenticationPrincipal Jwt jwt) {
        return almacenService.refreshAllGeocoding(jwt.getSubject());
    }

    @PatchMapping("/{id}/imagen")
    public AlmacenResponse updateImagenUrl(@AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @Valid @RequestBody AlmacenImagenRequest request) {
        return almacenService.updateImagenUrl(jwt.getSubject(), id, request);
    }
}
