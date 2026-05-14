package com.alovecino.consultaservice.service;

import com.alovecino.consultaservice.dto.ConsultaRequest;
import com.alovecino.consultaservice.dto.ConsultaResponse;
import com.alovecino.consultaservice.dto.ResponderConsultaRequest;
import com.alovecino.consultaservice.model.Consulta;
import com.alovecino.consultaservice.model.EstadoConsulta;
import com.alovecino.consultaservice.repository.AlmacenRepository;
import com.alovecino.consultaservice.repository.ClienteRepository;
import com.alovecino.consultaservice.repository.ConsultaRepository;
import com.alovecino.consultaservice.repository.EstadoConsultaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ConsultaService {

    private static final String ESTADO_PENDIENTE = "PENDIENTE";

    private final ConsultaRepository consultaRepository;
    private final EstadoConsultaRepository estadoConsultaRepository;
    private final ClienteRepository clienteRepository;
    private final AlmacenRepository almacenRepository;

    public ConsultaResponse crearConsulta(ConsultaRequest request) {
        validarClienteYAlmacen(request.getIdCliente(), request.getIdAlmacen());

        EstadoConsulta estadoPendiente = estadoConsultaRepository.findByNombre(ESTADO_PENDIENTE);
        if (estadoPendiente == null) {
            throw new IllegalArgumentException("El estado PENDIENTE no está configurado en el sistema");
        }

        Consulta consulta = new Consulta();
        consulta.setDescripcion(request.getDescripcion());
        consulta.setCantidad(request.getCantidad());
        consulta.setIdCliente(request.getIdCliente());
        consulta.setIdAlmacen(request.getIdAlmacen());
        consulta.setRespuesta(null);
        consulta.setFechaRespuesta(null);
        consulta.setIdEstadoConsulta(estadoPendiente.getIdEstadoConsulta());

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

    public ConsultaResponse responderConsulta(Long id, ResponderConsultaRequest request) {
        if (request.getRespuesta() == null || request.getRespuesta().isBlank()) {
            throw new IllegalArgumentException("La respuesta no puede estar vacía");
        }

        Consulta consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consulta no encontrada"));

        EstadoConsulta estado = estadoConsultaRepository.findById(request.getIdEstadoConsulta())
                .orElseThrow(() -> new IllegalArgumentException("El estado de consulta no existe"));

        consulta.setRespuesta(request.getRespuesta().trim());
        consulta.setFechaRespuesta(LocalDateTime.now());
        consulta.setIdEstadoConsulta(estado.getIdEstadoConsulta());

        Consulta updatedConsulta = consultaRepository.save(consulta);
        return mapToResponse(updatedConsulta);
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

    private void validarClienteYAlmacen(Long idCliente, Long idAlmacen) {
        if (!clienteRepository.existsById(idCliente)) {
            throw new IllegalArgumentException("El cliente no existe");
        }

        if (!almacenRepository.existsById(idAlmacen)) {
            throw new IllegalArgumentException("El almacén no existe");
        }
    }

    private ConsultaResponse mapToResponse(Consulta consulta) {
        ConsultaResponse response = new ConsultaResponse();
        response.setIdConsulta(consulta.getIdConsulta());
        response.setDescripcion(consulta.getDescripcion());
        response.setCantidad(consulta.getCantidad());
        response.setIdCliente(consulta.getIdCliente());
        response.setIdAlmacen(consulta.getIdAlmacen());
        response.setFechaRespuesta(consulta.getFechaRespuesta());
        response.setRespuesta(consulta.getRespuesta());
        response.setIdEstadoConsulta(consulta.getIdEstadoConsulta());
        response.setCreatedAt(consulta.getCreatedAt());
        response.setUpdatedAt(consulta.getUpdatedAt());
        return response;
    }
}
