package com.alovecino.usuarioservice.service;

import java.util.List;
import java.util.UUID;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.alovecino.usuarioservice.model.Rol;
import com.alovecino.usuarioservice.model.Usuario;
import com.alovecino.usuarioservice.repository.RolRepository;
import com.alovecino.usuarioservice.repository.UsuarioRepository;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, RolRepository rolRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        ensureRole("ADMIN");
        ensureRole("USER");
        ensureRole("STORE_OWNER");

        Rol adminRol = rolRepository.findByNombreRol("ADMIN")
                .orElseGet(() -> rolRepository.save(new Rol("ADMIN")));

        if (usuarioRepository.findByNombreUsuario("admin@alovecino.com").isEmpty()) {
            Usuario admin = new Usuario();
            admin.setNombreUsuario("admin@alovecino.com");
            admin.setNombre("Administrador");
            admin.setContrasena(passwordEncoder.encode("admin1234"));
            admin.setRol(adminRol);
            usuarioRepository.save(admin);
        }

        List<Usuario> usuariosSinUuid = usuarioRepository.findAll().stream()
                .filter(usuario -> usuario.getUuid() == null || usuario.getUuid().isBlank())
                .peek(usuario -> usuario.setUuid(UUID.randomUUID().toString()))
                .toList();
        usuarioRepository.saveAll(usuariosSinUuid);
    }

    private void ensureRole(String nombreRol) {
        rolRepository.findByNombreRol(nombreRol)
                .orElseGet(() -> rolRepository.save(new Rol(nombreRol)));
    }
}

