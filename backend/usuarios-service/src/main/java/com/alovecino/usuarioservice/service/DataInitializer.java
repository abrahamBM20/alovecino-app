package com.alovecino.usuarioservice.service;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.alovecino.usuarioservice.model.Comuna;
import com.alovecino.usuarioservice.model.EstadoCuenta;
import com.alovecino.usuarioservice.model.Region;
import com.alovecino.usuarioservice.model.Rol;
import com.alovecino.usuarioservice.model.TipoContacto;
import com.alovecino.usuarioservice.model.Usuario;
import com.alovecino.usuarioservice.repository.ComunaRepository;
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
    private final ComunaRepository comunaRepository;
    private final TipoContactoRepository tipoContactoRepository;

    public DataInitializer(UsuarioRepository usuarioRepository, RolRepository rolRepository,
            PasswordEncoder passwordEncoder, EstadoCuentaRepository estadoCuentaRepository,
            RegionRepository regionRepository, ComunaRepository comunaRepository,
            TipoContactoRepository tipoContactoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
        this.estadoCuentaRepository = estadoCuentaRepository;
        this.regionRepository = regionRepository;
        this.comunaRepository = comunaRepository;
        this.tipoContactoRepository = tipoContactoRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        ensureRole("CLIENTE");
        ensureRole("ALMACEN");
        ensureRole("ADMIN");
        ensureEstadoCuenta("ACTIVO", "Activo", "Cuenta habilitada para operar");
        ensureEstadoCuenta("PENDIENTE", "Pendiente", "Cuenta pendiente de revisión o activación");
        ensureEstadoCuenta("RECHAZADO", "Rechazado", "Cuenta rechazada durante revisión");
        ensureEstadoCuenta("SUSPENDIDO", "Suspendido", "Cuenta suspendida temporalmente");
        ensureEstadoCuenta("INACTIVO", "Inactivo", "Cuenta inactiva");
        ensureTipoContacto("TELEFONO", "Telefono");
        Region regionMetropolitana = ensureRegion(
                LocationCatalog.REGION_METROPOLITANA.nombre(),
                LocationCatalog.REGION_METROPOLITANA.codigo());
        LocationCatalog.COMUNAS_REGION_METROPOLITANA.forEach(comuna -> ensureComuna(comuna, regionMetropolitana));

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

    private Region ensureRegion(String nombre, String codigo) {
        return regionRepository.findByNombreIgnoreCaseOrCodigoIgnoreCase(nombre, codigo)
                .orElseGet(() -> regionRepository.save(new Region(nombre, codigo)));
    }

    private void ensureComuna(String nombre, Region region) {
        comunaRepository.findByNombreIgnoreCaseAndRegion(nombre, region)
                .orElseGet(() -> comunaRepository.save(new Comuna(nombre, region)));
    }

    private void ensureTipoContacto(String codigo, String nombre) {
        tipoContactoRepository.findByCodigo(codigo)
                .orElseGet(() -> tipoContactoRepository.save(new TipoContacto(codigo, nombre)));
    }
}

