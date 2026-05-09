package com.alovecino.usuarioservice.service;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.alovecino.usuarioservice.model.EstadoCuenta;
import com.alovecino.usuarioservice.model.Region;
import com.alovecino.usuarioservice.model.Rol;
import com.alovecino.usuarioservice.model.TipoContacto;
import com.alovecino.usuarioservice.model.Usuario;
import com.alovecino.usuarioservice.repository.EstadoCuentaRepository;
import com.alovecino.usuarioservice.repository.RegionRepository;
import com.alovecino.usuarioservice.repository.RolRepository;
import com.alovecino.usuarioservice.repository.TipoContactoRepository;
import com.alovecino.usuarioservice.repository.UsuarioRepository;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final EstadoCuentaRepository estadoCuentaRepository;
    private final RegionRepository regionRepository;
    private final TipoContactoRepository tipoContactoRepository;

    public DataInitializer(UsuarioRepository usuarioRepository, RolRepository rolRepository,
            PasswordEncoder passwordEncoder, EstadoCuentaRepository estadoCuentaRepository,
            RegionRepository regionRepository, TipoContactoRepository tipoContactoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
        this.estadoCuentaRepository = estadoCuentaRepository;
        this.regionRepository = regionRepository;
        this.tipoContactoRepository = tipoContactoRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        ensureRole("CLIENTE");
        ensureRole("ALMACEN");
        ensureRole("ADMIN");
        ensureEstadoCuenta("ACTIVO", "Activo", "Cuenta habilitada para operar");
        ensureEstadoCuenta("PENDIENTE", "Pendiente", "Cuenta pendiente de revisión o activación");
        ensureTipoContacto("TELEFONO", "Telefono");
        ensureRegion("Metropolitana de Santiago", "RM");

        Rol adminRol = rolRepository.findByNombreRol("ADMIN")
                .orElseGet(() -> rolRepository.save(new Rol("ADMIN")));

        if (usuarioRepository.findByCorreo("admin@alovecino.com").isEmpty()) {
            Usuario admin = new Usuario();
            admin.setRut("111111111");
            admin.setNombreUsuario("admin@alovecino.com");
            admin.setNombre("Administrador");
            admin.setCorreo("admin@alovecino.com");
            admin.setContrasena(passwordEncoder.encode("admin1234"));
            admin.setRol(adminRol);
            usuarioRepository.save(admin);
        }
    }

    private void ensureRole(String nombreRol) {
        rolRepository.findByNombreRol(nombreRol)
                .orElseGet(() -> rolRepository.save(new Rol(nombreRol)));
    }

    private void ensureEstadoCuenta(String codigo, String nombre, String descripcion) {
        estadoCuentaRepository.findByCodigo(codigo)
                .orElseGet(() -> estadoCuentaRepository.save(new EstadoCuenta(codigo, nombre, descripcion)));
    }

    private void ensureRegion(String nombre, String codigo) {
        regionRepository.findByNombreIgnoreCaseOrCodigoIgnoreCase(nombre, codigo)
                .orElseGet(() -> regionRepository.save(new Region(nombre, codigo)));
    }

    private void ensureTipoContacto(String codigo, String nombre) {
        tipoContactoRepository.findByCodigo(codigo)
                .orElseGet(() -> tipoContactoRepository.save(new TipoContacto(codigo, nombre)));
    }
}

