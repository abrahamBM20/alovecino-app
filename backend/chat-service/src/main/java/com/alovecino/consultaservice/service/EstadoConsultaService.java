package com.alovecino.consultaservice.service;

import com.alovecino.consultaservice.dto.EstadoConsultaRequest;
import com.alovecino.consultaservice.dto.EstadoConsultaResponse;
import com.alovecino.consultaservice.model.EstadoConsulta;
import com.alovecino.consultaservice.repository.EstadoConsultaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EstadoConsultaService {

    private final EstadoConsultaRepository estadoConsultaRepository;

    public EstadoConsultaResponse crearEstadoConsulta(EstadoConsultaRequest request) {
        EstadoConsulta estadoConsulta = new EstadoConsulta();
        estadoConsulta.setCodigo(toCodigo(request.getNombre()));
        estadoConsulta.setNombre(request.getNombre());
        estadoConsulta.setDescripcion(request.getDescripcion());

        EstadoConsulta savedEstadoConsulta = estadoConsultaRepository.save(estadoConsulta);
        return mapToResponse(savedEstadoConsulta);
    }

    @Transactional(readOnly = true)
    public List<EstadoConsultaResponse> obtenerEstadosConsulta() {
        return estadoConsultaRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EstadoConsultaResponse obtenerEstadoConsulta(Long id) {
        EstadoConsulta estadoConsulta = estadoConsultaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Estado de consulta no encontrado"));
        return mapToResponse(estadoConsulta);
    }

    public EstadoConsultaResponse actualizarEstadoConsulta(Long id, EstadoConsultaRequest request) {
        EstadoConsulta estadoConsulta = estadoConsultaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Estado de consulta no encontrado"));

        estadoConsulta.setCodigo(toCodigo(request.getNombre()));
        estadoConsulta.setNombre(request.getNombre());
        estadoConsulta.setDescripcion(request.getDescripcion());

        EstadoConsulta updatedEstadoConsulta = estadoConsultaRepository.save(estadoConsulta);
        return mapToResponse(updatedEstadoConsulta);
    }

    public void eliminarEstadoConsulta(Long id) {
        if (!estadoConsultaRepository.existsById(id)) {
            throw new RuntimeException("Estado de consulta no encontrado");
        }
        estadoConsultaRepository.deleteById(id);
    }

    private EstadoConsultaResponse mapToResponse(EstadoConsulta estadoConsulta) {
        EstadoConsultaResponse response = new EstadoConsultaResponse();
        response.setIdEstadoConsulta(estadoConsulta.getIdEstadoConsulta());
        response.setNombre(estadoConsulta.getNombre());
        response.setDescripcion(estadoConsulta.getDescripcion());
        response.setCreatedAt(estadoConsulta.getCreatedAt());
        response.setUpdatedAt(estadoConsulta.getUpdatedAt());
        return response;
    }

    private String toCodigo(String nombre) {
        return nombre.trim().toUpperCase().replace(' ', '_');
    }
}
