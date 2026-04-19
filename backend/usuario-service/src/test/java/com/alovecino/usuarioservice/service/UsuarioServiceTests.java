package com.alovecino.usuarioservice.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.alovecino.usuarioservice.dto.UsuarioRequest;
import com.alovecino.usuarioservice.dto.UsuarioResponse;
import com.alovecino.usuarioservice.repository.UsuarioRepository;

@SpringBootTest
class UsuarioServiceTests {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Test
    void shouldCreateAndFindUsuarioByNombre() {
        String uniqueUsername = "testuser_" + System.currentTimeMillis();

        UsuarioRequest request = new UsuarioRequest();
        request.setNombreUsuario(uniqueUsername);
        request.setContrasena("Password123");
        request.setNombreRol("USER");

        UsuarioResponse saved = usuarioService.createUsuario(request);

        assertThat(saved).isNotNull();
        assertThat(saved.getNombreUsuario()).isEqualTo(uniqueUsername);
        assertThat(saved.getNombreRol()).isEqualTo("USER");
        assertThat(usuarioRepository.findByNombreUsuario(uniqueUsername)).isPresent();
    }
}
