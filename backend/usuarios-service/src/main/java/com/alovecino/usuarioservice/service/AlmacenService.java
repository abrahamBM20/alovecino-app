package com.alovecino.usuarioservice.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
        Almacen almacen = almacenRepository.findById(idAlmacen)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Almacén no encontrado"));
        if (!almacen.getDueno().getIdUsuario().equals(dueno.getIdUsuario())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para modificar este almacén");
        }
        almacen.setImagenUrl(request.getImagenUrl());
        return toResponse(almacenRepository.save(almacen));
    }

    @Transactional(readOnly = true)
    public List<AlmacenResponse> listAlmacenesByDueno(String duenoIdentifier) {
        Usuario dueno = findUsuarioByPrincipal(duenoIdentifier);
        return almacenRepository.findByDuenoIdUsuarioOrderByIdAlmacenDesc(dueno.getIdUsuario()).stream()
                .map(this::toResponse)
                .toList();
    }

    private Usuario findUsuarioByPrincipal(String identifier) {
        return findUsuarioById(identifier)
                .or(() -> usuarioRepository.findByNombreUsuario(identifier))
                .or(() -> usuarioRepository.findByCorreo(identifier))
                .orElseThrow(() -> new UsuarioNotFoundException(identifier));
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
                direccion.getComuna().getNombre(),
                direccion.getComuna().getRegion().getNombre(),
                direccion.getLatitud().toPlainString(),
                direccion.getLongitud().toPlainString(),
                almacen.getEstadoCuenta().getCodigo(),
                almacen.getDueno().getIdUsuario(),
                almacen.getImagenUrl());
    }
}
