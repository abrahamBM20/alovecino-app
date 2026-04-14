package com.AloVecino.dev.usuario.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.AloVecino.dev.usuario.dto.UsuarioRequest;
import com.AloVecino.dev.usuario.dto.UsuarioResponse;
import com.AloVecino.dev.usuario.service.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> createUsuario(@Valid @RequestBody UsuarioRequest request) {
        UsuarioResponse response = usuarioService.createUsuario(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<UsuarioResponse> listUsuarios() {
        return usuarioService.listUsuarios();
    }

    @GetMapping("/{id}")
    public UsuarioResponse getUsuario(@PathVariable("id") Long id) {
        return usuarioService.getUsuarioById(id);
    }
}
