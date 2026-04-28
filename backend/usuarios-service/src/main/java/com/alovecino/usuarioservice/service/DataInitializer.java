package com.alovecino.usuarioservice.usuario.service;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.alovecino.usuarioservice.usuario.model.Rol;
import com.alovecino.usuarioservice.usuario.model.Usuario;
import com.alovecino.usuarioservice.usuario.repository.RolRepository;
import com.alovecino.usuarioservice.usuario.repository.UsuarioRepository;

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
        if (rolRepository.count() == 0) {
            rolRepository.save(new Rol("ADMIN"));
            rolRepository.save(new Rol("USER"));
        }

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
    }
}

