package com.alovecino.usuarioservice.bootstrap;

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
        if (rolRepository.count() == 0) {
            rolRepository.save(new Rol("ADMIN"));
            rolRepository.save(new Rol("USER"));
        }

        if (usuarioRepository.count() == 0) {
            Rol adminRol = rolRepository.findByNombreRol("ADMIN").orElseThrow();
            Usuario admin = new Usuario();
            admin.setNombreUsuario("admin");
            admin.setContrasena(passwordEncoder.encode("admin1234"));
            admin.setRol(adminRol);
            usuarioRepository.save(admin);
        }
    }
}
