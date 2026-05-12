package main.java.com.alovecino.consultaservice.service;

import main.java.com.alovecino.consultaservice.dto.ConsultaRequest;
import main.java.com.alovecino.consultaservice.dto.ConsultaResponse;
import main.java.com.alovecino.consultaservice.model.Consulta;
import main.java.com.alovecino.consultaservice.repository.ConsultaRepository;
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

    private final ConsultaRepository consultaRepository;

    public ConsultaResponse crearConsulta(ConsultaRequest request) {
        Consulta consulta = new Consulta();
        consulta.setDescripcion(request.getDescripcion());
        consulta.setCantidad(request.getCantidad());
        consulta.setIdCliente(request.getIdCliente());
        consulta.setIdAlmacen(request.getIdAlmacen());
        consulta.setRespuesta(request.getRespuesta());
        consulta.setIdEstadoConsulta(request.getIdEstadoConsulta());

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

    public ConsultaResponse responderConsulta(Long id, String respuesta, Long idEstadoConsulta) {
        Consulta consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consulta no encontrada"));

        consulta.setRespuesta(respuesta);
        consulta.setFechaRespuesta(LocalDateTime.now());
        consulta.setIdEstadoConsulta(idEstadoConsulta);

        Consulta updatedConsulta = consultaRepository.save(consulta);
        return mapToResponse(updatedConsulta);
    }

    public ConsultaResponse actualizarEstadoConsulta(Long id, Long idEstadoConsulta) {
        Consulta consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consulta no encontrada"));

        consulta.setIdEstadoConsulta(idEstadoConsulta);
        Consulta updatedConsulta = consultaRepository.save(consulta);
        return mapToResponse(updatedConsulta);
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