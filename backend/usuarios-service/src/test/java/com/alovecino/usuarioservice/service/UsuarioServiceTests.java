package com.alovecino.usuarioservice.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.alovecino.usuarioservice.dto.UsuarioRequest;
import com.alovecino.usuarioservice.dto.UsuarioResponse;
import com.alovecino.usuarioservice.repository.UsuarioRepository;
import com.alovecino.usuarioservice.service.UsuarioService;

@SpringBootTest
class UsuarioServiceTests {

    private String createdNombreUsuario;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Test
    void shouldCreateAndFindUsuarioByNombre() {
        createdNombreUsuario = "testuser-" + UUID.randomUUID() + "@alovecino.test";

        UsuarioRequest request = new UsuarioRequest();
        request.setNombreUsuario(createdNombreUsuario);
        request.setContrasena("Password123");
        request.setNombreRol("USER");

        UsuarioResponse saved = usuarioService.createUsuario(request);

        assertThat(saved).isNotNull();
        assertThat(saved.getNombreUsuario()).isEqualTo(createdNombreUsuario);
        assertThat(saved.getNombreRol()).isEqualTo("USER");
        assertThat(usuarioRepository.findByNombreUsuario(createdNombreUsuario)).isPresent();
    }

    @AfterEach
    void tearDown() {
        if (createdNombreUsuario != null) {
            usuarioRepository.findByNombreUsuario(createdNombreUsuario)
                    .ifPresent(usuarioRepository::delete);
        }
    }
}

