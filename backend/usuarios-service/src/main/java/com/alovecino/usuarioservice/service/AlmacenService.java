package com.alovecino.usuarioservice.service;

import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.alovecino.usuarioservice.dto.AlmacenEstadoRequest;
import com.alovecino.usuarioservice.dto.AlmacenImagenRequest;
import com.alovecino.usuarioservice.dto.AlmacenRequest;
import com.alovecino.usuarioservice.dto.AlmacenResponse;
import com.alovecino.usuarioservice.exception.UsuarioNotFoundException;
import com.alovecino.usuarioservice.model.Almacen;
import com.alovecino.usuarioservice.model.AlmacenContacto;
import com.alovecino.usuarioservice.model.Direccion;
import com.alovecino.usuarioservice.model.EstadoCuenta;
import com.alovecino.usuarioservice.model.TipoContacto;
import com.alovecino.usuarioservice.model.Usuario;
import com.alovecino.usuarioservice.repository.AlmacenContactoRepository;
import com.alovecino.usuarioservice.repository.AlmacenRepository;
import com.alovecino.usuarioservice.repository.EstadoCuentaRepository;
import com.alovecino.usuarioservice.repository.TipoContactoRepository;
import com.alovecino.usuarioservice.repository.UsuarioRepository;

@Service
public class AlmacenService {

    private static final Set<String> ESTADOS_ADMINISTRABLES = Set.of(
            "PENDIENTE", "ACTIVO", "RECHAZADO", "SUSPENDIDO", "INACTIVO");

    private final AlmacenRepository almacenRepository;
    private final UsuarioRepository usuarioRepository;
    private final EstadoCuentaRepository estadoCuentaRepository;
    private final TipoContactoRepository tipoContactoRepository;
    private final AlmacenContactoRepository almacenContactoRepository;
    private final UsuarioService usuarioService;

    public AlmacenService(AlmacenRepository almacenRepository, UsuarioRepository usuarioRepository,
            EstadoCuentaRepository estadoCuentaRepository, TipoContactoRepository tipoContactoRepository,
            AlmacenContactoRepository almacenContactoRepository, UsuarioService usuarioService) {
        this.almacenRepository = almacenRepository;
        this.usuarioRepository = usuarioRepository;
        this.estadoCuentaRepository = estadoCuentaRepository;
        this.tipoContactoRepository = tipoContactoRepository;
        this.almacenContactoRepository = almacenContactoRepository;
        this.usuarioService = usuarioService;
    }

    @Transactional
    public AlmacenResponse createAlmacen(String duenoIdentifier, AlmacenRequest request) {
        Usuario dueno = findUsuarioByPrincipal(duenoIdentifier);
        if (!"ALMACEN".equalsIgnoreCase(dueno.getRol().getNombreRol())) {
            throw new AccessDeniedException("Solo usuarios de tipo almacén pueden registrar almacenes");
        }

        EstadoCuenta estadoCuenta = estadoCuentaRepository.findByCodigo("PENDIENTE")
                .orElseGet(() -> estadoCuentaRepository.save(new EstadoCuenta("PENDIENTE", "PENDIENTE", null)));
        Direccion direccion = usuarioService.createDireccionForAlmacen(request.getDireccion());

        Almacen almacen = new Almacen();
        almacen.setNombre(request.getNombre());
        almacen.setDireccion(direccion);
        almacen.setEstadoCuenta(estadoCuenta);
        almacen.setDueno(dueno);

        Almacen saved = almacenRepository.save(almacen);
        TipoContacto tipoTelefono = tipoContactoRepository.findByCodigo("TELEFONO")
                .orElseGet(() -> tipoContactoRepository.save(new TipoContacto("TELEFONO", "Telefono")));
        AlmacenContacto contacto = new AlmacenContacto();
        contacto.setAlmacen(saved);
        contacto.setTipoContacto(tipoTelefono);
        contacto.setValor(request.getTelefono());
        contacto.setNombreContacto(request.getNombre());
        contacto.setEsPrincipal(true);
        almacenContactoRepository.save(contacto);
        return toResponse(saved);
    }

    @Transactional
    public AlmacenResponse updateImagenUrl(String duenoIdentifier, Long idAlmacen, AlmacenImagenRequest request) {
        Usuario dueno = findUsuarioByPrincipal(duenoIdentifier);
        Almacen almacen = findOwnedAlmacen(dueno, idAlmacen, "modificar");
        almacen.setImagenUrl(request.getImagenUrl());
        return toResponse(almacenRepository.save(almacen));
    }

    @Transactional
    public AlmacenResponse updateAlmacen(String duenoIdentifier, Long idAlmacen, AlmacenRequest request) {
        Usuario dueno = findUsuarioByPrincipal(duenoIdentifier);
        Almacen almacen = findOwnedAlmacen(dueno, idAlmacen, "modificar");

        almacen.setNombre(request.getNombre());
        usuarioService.updateDireccionForAlmacen(almacen.getDireccion(), request.getDireccion());
        upsertTelefonoPrincipal(almacen, request.getTelefono());

        return toResponse(almacenRepository.save(almacen));
    }

    @Transactional
    public AlmacenResponse updateEstadoAlmacen(String adminIdentifier, Long idAlmacen, AlmacenEstadoRequest request) {
        assertAdmin(adminIdentifier);

        String estadoCodigo = request.getEstado().trim().toUpperCase();
        if (!ESTADOS_ADMINISTRABLES.contains(estadoCodigo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Estado de almacén no permitido: " + estadoCodigo);
        }

        Almacen almacen = almacenRepository.findById(idAlmacen)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Almacén no encontrado"));
        EstadoCuenta estadoCuenta = estadoCuentaRepository.findByCodigo(estadoCodigo)
                .orElseGet(() -> estadoCuentaRepository.save(new EstadoCuenta(estadoCodigo, estadoCodigo, null)));
        almacen.setEstadoCuenta(estadoCuenta);
        return toResponse(almacenRepository.save(almacen));
    }

    @Transactional
    public AlmacenResponse refreshGeocoding(String adminIdentifier, Long idAlmacen) {
        assertAdmin(adminIdentifier);
        Almacen almacen = almacenRepository.findById(idAlmacen)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Almacén no encontrado"));
        usuarioService.refreshGeocodingForAlmacen(almacen.getDireccion());
        return toResponse(almacenRepository.save(almacen));
    }

    @Transactional
    public List<AlmacenResponse> refreshAllGeocoding(String adminIdentifier) {
        assertAdmin(adminIdentifier);
        return almacenRepository.findAll().stream()
                .map(almacen -> {
                    usuarioService.refreshGeocodingForAlmacen(almacen.getDireccion());
                    return toResponse(almacenRepository.save(almacen));
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AlmacenResponse> listAlmacenesByDueno(String duenoIdentifier) {
        Usuario dueno = findUsuarioByPrincipal(duenoIdentifier);
        return almacenRepository.findByDuenoIdUsuarioOrderByIdAlmacenDesc(dueno.getIdUsuario()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AlmacenResponse getAlmacenByDueno(String duenoIdentifier, Long idAlmacen) {
        Usuario dueno = findUsuarioByPrincipal(duenoIdentifier);
        return toResponse(findOwnedAlmacen(dueno, idAlmacen, "ver"));
    }

    private Almacen findOwnedAlmacen(Usuario dueno, Long idAlmacen, String accion) {
        Almacen almacen = almacenRepository.findById(idAlmacen)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Almacén no encontrado"));
        if (!almacen.getDueno().getIdUsuario().equals(dueno.getIdUsuario())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "No tienes permiso para " + accion + " este almacén");
        }
        return almacen;
    }

    private void upsertTelefonoPrincipal(Almacen almacen, String telefono) {
        TipoContacto tipoTelefono = tipoContactoRepository.findByCodigo("TELEFONO")
                .orElseGet(() -> tipoContactoRepository.save(new TipoContacto("TELEFONO", "Telefono")));

        AlmacenContacto contacto = almacenContactoRepository
                .findFirstByAlmacenIdAlmacenAndEsPrincipalTrueOrderByIdAlmacenContactoAsc(almacen.getIdAlmacen())
                .orElseGet(() -> {
                    AlmacenContacto nuevo = new AlmacenContacto();
                    nuevo.setAlmacen(almacen);
                    nuevo.setTipoContacto(tipoTelefono);
                    nuevo.setEsPrincipal(true);
                    return nuevo;
                });

        contacto.setTipoContacto(tipoTelefono);
        contacto.setValor(telefono);
        contacto.setNombreContacto(almacen.getNombre());
        almacenContactoRepository.save(contacto);
    }

    private Usuario findUsuarioByPrincipal(String identifier) {
        return findUsuarioById(identifier)
                .or(() -> usuarioRepository.findByNombreUsuario(identifier))
                .or(() -> usuarioRepository.findByCorreo(identifier))
                .orElseThrow(() -> new UsuarioNotFoundException(identifier));
    }

    private void assertAdmin(String identifier) {
        Usuario admin = findUsuarioByPrincipal(identifier);
        if (!"ADMIN".equalsIgnoreCase(admin.getRol().getNombreRol())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Solo usuarios administradores pueden administrar almacenes");
        }
    }

    private java.util.Optional<Usuario> findUsuarioById(String identifier) {
        try {
            return usuarioRepository.findById(Long.valueOf(identifier));
        } catch (NumberFormatException ex) {
            return java.util.Optional.empty();
        }
    }

    private AlmacenResponse toResponse(Almacen almacen) {
        Direccion direccion = almacen.getDireccion();
        return new AlmacenResponse(
                almacen.getIdAlmacen(),
                almacen.getNombre(),
                direccion.getCalle(),
                direccion.getNumero(),
                direccion.getCodigoPostal(),
                direccion.getComuna().getNombre(),
                direccion.getComuna().getRegion().getNombre(),
                direccion.getLatitud().toPlainString(),
                direccion.getLongitud().toPlainString(),
                almacen.getEstadoCuenta().getCodigo(),
                almacen.getDueno().getIdUsuario(),
                almacen.getImagenUrl(),
                almacenContactoRepository
                        .findFirstByAlmacenIdAlmacenAndEsPrincipalTrueOrderByIdAlmacenContactoAsc(almacen.getIdAlmacen())
                        .map(AlmacenContacto::getValor)
                        .orElse(null));
    }
}
