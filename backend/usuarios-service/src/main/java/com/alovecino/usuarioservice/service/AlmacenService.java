package com.alovecino.usuarioservice.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alovecino.usuarioservice.dto.AlmacenRequest;
import com.alovecino.usuarioservice.dto.AlmacenResponse;
import com.alovecino.usuarioservice.exception.UsuarioNotFoundException;
import com.alovecino.usuarioservice.model.Almacen;
import com.alovecino.usuarioservice.model.EstadoAlmacen;
import com.alovecino.usuarioservice.model.Usuario;
import com.alovecino.usuarioservice.repository.AlmacenRepository;
import com.alovecino.usuarioservice.repository.UsuarioRepository;

@Service
public class AlmacenService {

    private final AlmacenRepository almacenRepository;
    private final UsuarioRepository usuarioRepository;

    public AlmacenService(AlmacenRepository almacenRepository, UsuarioRepository usuarioRepository) {
        this.almacenRepository = almacenRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public AlmacenResponse createAlmacen(String duenoIdentifier, AlmacenRequest request) {
        Usuario dueno = findUsuarioByPrincipal(duenoIdentifier);

        Almacen almacen = new Almacen();
        almacen.setNombre(request.getNombre());
        almacen.setDireccion(request.getDireccion());
        almacen.setComuna(request.getComuna());
        almacen.setTelefono(request.getTelefono());
        almacen.setEstado(EstadoAlmacen.PENDIENTE);
        almacen.setDueno(dueno);

        return toResponse(almacenRepository.save(almacen));
    }

    @Transactional(readOnly = true)
    public List<AlmacenResponse> listAlmacenesByDueno(String duenoIdentifier) {
        Usuario dueno = findUsuarioByPrincipal(duenoIdentifier);
        String duenoUuid = dueno.getUuid();
        return almacenRepository.findByDuenoUuidOrderByIdAlmacenDesc(duenoUuid).stream()
                .map(this::toResponse)
                .toList();
    }

    private Usuario findUsuarioByPrincipal(String identifier) {
        return usuarioRepository.findByUuid(identifier)
                .or(() -> findUsuarioById(identifier))
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
        return new AlmacenResponse(
                almacen.getUuid(),
                almacen.getNombre(),
                almacen.getDireccion(),
                almacen.getComuna(),
                almacen.getTelefono(),
                almacen.getEstado().name(),
                almacen.getDueno().getUuid());
    }
}
