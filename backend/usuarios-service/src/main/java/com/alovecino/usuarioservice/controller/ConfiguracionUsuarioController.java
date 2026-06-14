package com.alovecino.usuarioservice.controller;

import jakarta.validation.Valid;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.alovecino.usuarioservice.dto.ConfiguracionUsuarioRequest;
import com.alovecino.usuarioservice.dto.ConfiguracionUsuarioResponse;
import com.alovecino.usuarioservice.service.ConfiguracionUsuarioService;

@RestController
@RequestMapping("/api/configuracion")
public class ConfiguracionUsuarioController {

    private final ConfiguracionUsuarioService configuracionUsuarioService;

    public ConfiguracionUsuarioController(ConfiguracionUsuarioService configuracionUsuarioService) {
        this.configuracionUsuarioService = configuracionUsuarioService;
    }

    @GetMapping("/{idUsuario}")
    public ConfiguracionUsuarioResponse getConfiguracion(
            @PathVariable Long idUsuario,
            @AuthenticationPrincipal Jwt jwt) {
        return configuracionUsuarioService.getConfiguracion(idUsuario, jwt.getSubject());
    }

    @PutMapping("/{idUsuario}")
    public ConfiguracionUsuarioResponse updateConfiguracion(
            @PathVariable Long idUsuario,
            @Valid @RequestBody ConfiguracionUsuarioRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return configuracionUsuarioService.updateConfiguracion(idUsuario, jwt.getSubject(), request);
    }
}
