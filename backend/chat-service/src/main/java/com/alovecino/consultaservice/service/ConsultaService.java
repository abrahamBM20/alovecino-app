package com.alovecino.consultaservice.service;

import com.alovecino.consultaservice.dto.ConsultaDetalleRequest;
import com.alovecino.consultaservice.dto.ConsultaDetalleResponse;
import com.alovecino.consultaservice.dto.DashboardAlmacenResponse;
import com.alovecino.consultaservice.dto.ConsultaRequest;
import com.alovecino.consultaservice.dto.ConsultaResponse;
import com.alovecino.consultaservice.dto.ResponderConsultaRequest;
import com.alovecino.consultaservice.model.Almacen;
import com.alovecino.consultaservice.model.Cliente;
import com.alovecino.consultaservice.model.Consulta;
import com.alovecino.consultaservice.model.ConsultaDetalle;
import com.alovecino.consultaservice.model.EstadoConsulta;
import com.alovecino.consultaservice.repository.AlmacenRepository;
import com.alovecino.consultaservice.repository.ClienteRepository;
import com.alovecino.consultaservice.repository.ConsultaRepository;
import com.alovecino.consultaservice.repository.EstadoConsultaRepository;
import com.alovecino.consultaservice.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ConsultaService {

    private static final String ESTADO_PENDIENTE = "PENDIENTE";
    private static final String ESTADO_RESPONDIDA = "RESPONDIDA";
    private static final String ESTADO_CERRADA = "CERRADA";

    private final ConsultaRepository consultaRepository;
    private final EstadoConsultaRepository estadoConsultaRepository;
    private final ClienteRepository clienteRepository;
    private final AlmacenRepository almacenRepository;
    private final UsuarioRepository usuarioRepository;

    public ConsultaResponse crearConsulta(ConsultaRequest request) {
        validarClienteYAlmacen(request.getIdCliente(), request.getIdAlmacen());

        EstadoConsulta estadoPendiente = estadoConsultaRepository.findByNombre(ESTADO_PENDIENTE);
        if (estadoPendiente == null) {
            throw new IllegalArgumentException("El estado PENDIENTE no está configurado en el sistema");
        }

        Consulta consulta = new Consulta();
        consulta.setIdCliente(request.getIdCliente());
        consulta.setIdAlmacen(request.getIdAlmacen());
        consulta.setRespuesta(null);
        consulta.setFechaRespuesta(null);
        consulta.setIdEstadoConsulta(estadoPendiente.getIdEstadoConsulta());
        buildDetalles(request).forEach(consulta::addDetalle);

        Consulta savedConsulta = consultaRepository.save(consulta);
        return mapToResponse(savedConsulta);
    }

    @Transactional(readOnly = true)
    public ConsultaResponse obtenerConsulta(Long id) {
        Consulta consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consulta no encontrada"));
        return mapToResponse(consulta);
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponse> obtenerConsultasPorCliente(Long idCliente) {
        return consultaRepository.findConsultasByCliente(idCliente)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponse> obtenerConsultasPorAlmacen(Long idAlmacen) {
        return consultaRepository.findConsultasByAlmacen(idAlmacen)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponse> obtenerConsultasPorAlmacen(String duenoIdentifier, Long idAlmacen) {
        validarDuenoAlmacen(duenoIdentifier, idAlmacen);
        return obtenerConsultasPorAlmacen(idAlmacen);
    }

    @Transactional(readOnly = true)
    public DashboardAlmacenResponse obtenerDashboardAlmacen(String duenoIdentifier, Long idAlmacen) {
        validarDuenoAlmacen(duenoIdentifier, idAlmacen);
        List<ConsultaResponse> consultas = obtenerConsultasPorAlmacen(idAlmacen);
        Map<Long, String> estados = estadoConsultaRepository.findAll().stream()
                .collect(Collectors.toMap(EstadoConsulta::getIdEstadoConsulta, EstadoConsulta::getNombre));
        LocalDate hoy = LocalDate.now();

        DashboardAlmacenResponse response = new DashboardAlmacenResponse();
        response.setIdAlmacen(idAlmacen);
        response.setTotalConsultas(consultas.size());
        response.setConsultasHoy(consultas.stream()
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().toLocalDate().isEqual(hoy))
                .count());
        response.setPendientes(countByEstado(consultas, estados, ESTADO_PENDIENTE));
        response.setRespondidas(countByEstado(consultas, estados, ESTADO_RESPONDIDA));
        response.setCerradas(countByEstado(consultas, estados, ESTADO_CERRADA));
        response.setTiempoPromedioMin(calcularTiempoPromedioMin(consultas));
        response.setConsultasRecientes(consultas.stream()
                .sorted(Comparator.comparing(ConsultaResponse::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .toList());
        return response;
    }

    public ConsultaResponse responderConsulta(Long id, ResponderConsultaRequest request) {
        if (request.getRespuesta() == null || request.getRespuesta().isBlank()) {
            throw new IllegalArgumentException("La respuesta no puede estar vacía");
        }

        Consulta consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consulta no encontrada"));

        EstadoConsulta estado = resolverEstadoRespuesta(request.getIdEstadoConsulta());

        consulta.setRespuesta(request.getRespuesta().trim());
        consulta.setFechaRespuesta(LocalDateTime.now());
        consulta.setIdEstadoConsulta(estado.getIdEstadoConsulta());

        Consulta updatedConsulta = consultaRepository.save(consulta);
        return mapToResponse(updatedConsulta);
    }

    public ConsultaResponse responderConsulta(String duenoIdentifier, Long id, ResponderConsultaRequest request) {
        Consulta consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consulta no encontrada"));
        validarDuenoAlmacen(duenoIdentifier, consulta.getIdAlmacen());
        return responderConsulta(id, request);
    }

    public ConsultaResponse actualizarEstadoConsulta(Long id, Long idEstadoConsulta) {
        Consulta consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consulta no encontrada"));

        EstadoConsulta estado = estadoConsultaRepository.findById(idEstadoConsulta)
                .orElseThrow(() -> new IllegalArgumentException("El estado de consulta no existe"));

        consulta.setIdEstadoConsulta(estado.getIdEstadoConsulta());
        Consulta updatedConsulta = consultaRepository.save(consulta);
        return mapToResponse(updatedConsulta);
    }

    public ConsultaResponse actualizarEstadoConsulta(String duenoIdentifier, Long id, Long idEstadoConsulta) {
        Consulta consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consulta no encontrada"));
        validarDuenoAlmacen(duenoIdentifier, consulta.getIdAlmacen());
        return actualizarEstadoConsulta(id, idEstadoConsulta);
    }

    private void validarClienteYAlmacen(Long idCliente, Long idAlmacen) {
        if (!clienteRepository.existsById(idCliente)) {
            throw new IllegalArgumentException("El cliente no existe");
        }

        if (!almacenRepository.existsById(idAlmacen)) {
            throw new IllegalArgumentException("El almacén no existe");
        }
    }

    private void validarDuenoAlmacen(String identifier, Long idAlmacen) {
        Long idUsuario = parseUsuarioId(identifier);
        Almacen almacen = almacenRepository.findById(idAlmacen)
                .orElseThrow(() -> new IllegalArgumentException("El almacén no existe"));
        if (!Objects.equals(almacen.getIdUsuario(), idUsuario)) {
            throw new org.springframework.security.access.AccessDeniedException("No tienes permiso para operar sobre este almacén");
        }
    }

    private Long parseUsuarioId(String identifier) {
        try {
            return Long.valueOf(identifier);
        } catch (NumberFormatException ex) {
            throw new org.springframework.security.access.AccessDeniedException("Identificador de usuario inválido");
        }
    }

    private EstadoConsulta resolverEstadoRespuesta(Long idEstadoConsulta) {
        if (idEstadoConsulta != null) {
            return estadoConsultaRepository.findById(idEstadoConsulta)
                    .orElseThrow(() -> new IllegalArgumentException("El estado de consulta no existe"));
        }

        EstadoConsulta estado = estadoConsultaRepository.findByNombre(ESTADO_RESPONDIDA);
        if (estado == null) {
            throw new IllegalArgumentException("El estado RESPONDIDA no está configurado en el sistema");
        }
        return estado;
    }

    private long countByEstado(List<ConsultaResponse> consultas, Map<Long, String> estados, String estado) {
        return consultas.stream()
                .filter(c -> estado.equalsIgnoreCase(c.getEstadoNombre() != null
                        ? c.getEstadoNombre()
                        : estados.get(c.getIdEstadoConsulta())))
                .count();
    }

    private Long calcularTiempoPromedioMin(List<ConsultaResponse> consultas) {
        List<Long> minutos = consultas.stream()
                .filter(c -> c.getCreatedAt() != null && c.getFechaRespuesta() != null)
                .map(c -> ChronoUnit.MINUTES.between(c.getCreatedAt(), c.getFechaRespuesta()))
                .filter(m -> m >= 0)
                .toList();
        if (minutos.isEmpty()) {
            return null;
        }
        return Math.round(minutos.stream().mapToLong(Long::longValue).average().orElse(0));
    }

    private ConsultaResponse mapToResponse(Consulta consulta) {
        ConsultaResponse response = new ConsultaResponse();
        response.setIdConsulta(consulta.getIdConsulta());
        response.setDetalles(mapDetalles(consulta));
        response.setIdCliente(consulta.getIdCliente());
        response.setClienteNombre(resolveClienteNombre(consulta.getIdCliente()));
        response.setIdAlmacen(consulta.getIdAlmacen());
        response.setFechaRespuesta(consulta.getFechaRespuesta());
        response.setRespuesta(consulta.getRespuesta());
        response.setIdEstadoConsulta(consulta.getIdEstadoConsulta());
        response.setEstadoNombre(resolveEstadoNombre(consulta.getIdEstadoConsulta()));
        response.setCreatedAt(consulta.getCreatedAt());
        response.setUpdatedAt(consulta.getUpdatedAt());
        return response;
    }

    private List<ConsultaDetalle> buildDetalles(ConsultaRequest request) {
        if (request.getDetalles() == null || request.getDetalles().isEmpty()) {
            throw new IllegalArgumentException("Debe informar al menos un detalle de consulta");
        }

        return request.getDetalles().stream()
                .map(this::toDetalle)
                .toList();
    }

    private ConsultaDetalle toDetalle(ConsultaDetalleRequest request) {
        ConsultaDetalle detalle = new ConsultaDetalle();
        detalle.setDescripcion(request.getDescripcion().trim());
        detalle.setCantidadSolicitada(request.getCantidadSolicitada());
        return detalle;
    }

    private List<ConsultaDetalleResponse> mapDetalles(Consulta consulta) {
        return consulta.getDetalles().stream()
                .sorted(Comparator.comparing(
                        ConsultaDetalle::getIdConsultaDetalle,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::mapDetalleToResponse)
                .toList();
    }

    private ConsultaDetalleResponse mapDetalleToResponse(ConsultaDetalle detalle) {
        ConsultaDetalleResponse response = new ConsultaDetalleResponse();
        response.setIdConsultaDetalle(detalle.getIdConsultaDetalle());
        response.setDescripcion(detalle.getDescripcion());
        response.setCantidadSolicitada(detalle.getCantidadSolicitada());
        response.setCreatedAt(detalle.getCreatedAt());
        response.setUpdatedAt(detalle.getUpdatedAt());
        return response;
    }

    private String resolveClienteNombre(Long idCliente) {
        if (idCliente == null) {
            return null;
        }
        return clienteRepository.findById(idCliente)
                .map(Cliente::getIdUsuario)
                .flatMap(usuarioRepository::findById)
                .map(usuario -> usuario.getNombre() + (usuario.getApellido() != null ? " " + usuario.getApellido() : ""))
                .orElse(null);
    }

    private String resolveEstadoNombre(Long idEstadoConsulta) {
        if (idEstadoConsulta == null) {
            return null;
        }
        return estadoConsultaRepository.findById(idEstadoConsulta)
                .map(EstadoConsulta::getNombre)
                .orElse(null);
    }
}
