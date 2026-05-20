package com.alovecino.usuarioservice.service;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.alovecino.usuarioservice.dto.ValoracionRequest;
import com.alovecino.usuarioservice.dto.ValoracionResponse;
import com.alovecino.usuarioservice.dto.ValoracionUpdateRequest;
import com.alovecino.usuarioservice.exception.UsuarioNotFoundException;
import com.alovecino.usuarioservice.model.Almacen;
import com.alovecino.usuarioservice.model.Cliente;
import com.alovecino.usuarioservice.model.Usuario;
import com.alovecino.usuarioservice.model.Valoracion;
import com.alovecino.usuarioservice.repository.AlmacenRepository;
import com.alovecino.usuarioservice.repository.ClienteRepository;
import com.alovecino.usuarioservice.repository.UsuarioRepository;
import com.alovecino.usuarioservice.repository.ValoracionRepository;

@Service
public class ValoracionService {

    private final ValoracionRepository valoracionRepository;
    private final ClienteRepository clienteRepository;
    private final AlmacenRepository almacenRepository;
    private final UsuarioRepository usuarioRepository;

    public ValoracionService(ValoracionRepository valoracionRepository, ClienteRepository clienteRepository,
            AlmacenRepository almacenRepository, UsuarioRepository usuarioRepository) {
        this.valoracionRepository = valoracionRepository;
        this.clienteRepository = clienteRepository;
        this.almacenRepository = almacenRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public ValoracionResponse createValoracion(String principal, ValoracionRequest request) {
        Usuario usuario = findUsuarioByPrincipal(principal);
        Cliente cliente = clienteRepository.findByUsuarioIdUsuario(usuario.getIdUsuario())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Perfil de cliente no encontrado"));

        Almacen almacen = almacenRepository.findById(request.getIdAlmacen())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Almacén no encontrado"));

        if (almacen.getDueno().getIdUsuario().equals(usuario.getIdUsuario())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes valorar tu propio almacén");
        }

        if (valoracionRepository.existsByClienteIdClienteAndAlmacenIdAlmacen(
                cliente.getIdCliente(), almacen.getIdAlmacen())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una valoración para este almacén");
        }

        Valoracion valoracion = new Valoracion();
        valoracion.setCantidadEstrellas(request.getCantidadEstrellas());
        valoracion.setContenido(request.getContenido());
        valoracion.setCliente(cliente);
        valoracion.setAlmacen(almacen);

        return toResponse(valoracionRepository.save(valoracion));
    }

    @Transactional(readOnly = true)
    public List<ValoracionResponse> listByAlmacen(Long idAlmacen) {
        return valoracionRepository.findByAlmacenIdAlmacenOrderByIdValoracionDesc(idAlmacen).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ValoracionResponse> listMisValoraciones(String principal) {
        Cliente cliente = findCliente(principal);
        return valoracionRepository.findByClienteIdClienteOrderByIdValoracionDesc(cliente.getIdCliente()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ValoracionResponse updateValoracion(String principal, Long idValoracion, ValoracionUpdateRequest request) {
        Cliente cliente = findCliente(principal);
        Valoracion valoracion = valoracionRepository.findById(idValoracion)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Valoración no encontrada"));
        if (!valoracion.getCliente().getIdCliente().equals(cliente.getIdCliente())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para modificar esta valoración");
        }
        valoracion.setCantidadEstrellas(request.getCantidadEstrellas());
        valoracion.setContenido(request.getContenido());
        return toResponse(valoracionRepository.save(valoracion));
    }

    @Transactional
    public void deleteValoracion(String principal, Long idValoracion) {
        Cliente cliente = findCliente(principal);
        Valoracion valoracion = valoracionRepository.findById(idValoracion)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Valoración no encontrada"));
        if (!valoracion.getCliente().getIdCliente().equals(cliente.getIdCliente())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para eliminar esta valoración");
        }
        valoracionRepository.delete(valoracion);
    }

    private Cliente findCliente(String principal) {
        Usuario usuario = findUsuarioByPrincipal(principal);
        return clienteRepository.findByUsuarioIdUsuario(usuario.getIdUsuario())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Perfil de cliente no encontrado"));
    }

    private Usuario findUsuarioByPrincipal(String identifier) {
        return findUsuarioById(identifier)
                .or(() -> usuarioRepository.findByNombreUsuario(identifier))
                .or(() -> usuarioRepository.findByCorreo(identifier))
                .orElseThrow(() -> new UsuarioNotFoundException(identifier));
    }

    private Optional<Usuario> findUsuarioById(String identifier) {
        try {
            return usuarioRepository.findById(Long.valueOf(identifier));
        } catch (NumberFormatException ex) {
            return Optional.empty();
        }
    }

    private ValoracionResponse toResponse(Valoracion v) {
        return new ValoracionResponse(
                v.getIdValoracion(),
                v.getCantidadEstrellas(),
                v.getContenido(),
                v.getCliente().getIdCliente(),
                v.getAlmacen().getIdAlmacen(),
                v.getFechaCreacion(),
                v.getFechaActualizacion());
    }
}
