package com.AloVecino.dev.usuario.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.AloVecino.dev.usuario.dto.UsuarioRequest;
import com.AloVecino.dev.usuario.dto.UsuarioResponse;
import com.AloVecino.dev.usuario.repository.UsuarioRepository;
import com.AloVecino.dev.usuario.service.UsuarioService;

@SpringBootTest
class UsuarioServiceTests {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Test
    void shouldCreateAndFindUsuarioByNombre() {
        UsuarioRequest request = new UsuarioRequest();
        request.setNombreUsuario("testuser");
        request.setContrasena("Password123");
        request.setNombreRol("USER");

        UsuarioResponse saved = usuarioService.createUsuario(request);

        assertThat(saved).isNotNull();
        assertThat(saved.getNombreUsuario()).isEqualTo("testuser");
        assertThat(saved.getNombreRol()).isEqualTo("USER");
        assertThat(usuarioRepository.findByNombreUsuario("testuser")).isPresent();
    }
}
