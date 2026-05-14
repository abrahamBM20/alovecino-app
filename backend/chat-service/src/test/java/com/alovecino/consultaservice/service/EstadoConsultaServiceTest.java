package com.alovecino.consultaservice.service;

import com.alovecino.consultaservice.dto.EstadoConsultaRequest;
import com.alovecino.consultaservice.dto.EstadoConsultaResponse;
import com.alovecino.consultaservice.model.EstadoConsulta;
import com.alovecino.consultaservice.repository.EstadoConsultaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EstadoConsultaServiceTest {

    @Mock
    private EstadoConsultaRepository estadoConsultaRepository;

    @InjectMocks
    private EstadoConsultaService estadoConsultaService;

    @Test
    void crearEstadoConsulta_debeGuardarEstadoYRetornarResponseMapeado() {
        EstadoConsultaRequest request = nuevoEstadoRequest("PENDIENTE", "Consulta creada y pendiente de respuesta");
        EstadoConsulta estadoGuardado = nuevoEstado(1L, request.getNombre(), request.getDescripcion());

        when(estadoConsultaRepository.save(any(EstadoConsulta.class))).thenReturn(estadoGuardado);

        EstadoConsultaResponse response = estadoConsultaService.crearEstadoConsulta(request);

        ArgumentCaptor<EstadoConsulta> estadoCaptor = ArgumentCaptor.forClass(EstadoConsulta.class);
        verify(estadoConsultaRepository).save(estadoCaptor.capture());

        EstadoConsulta estadoEnviadoAGuardar = estadoCaptor.getValue();
        assertThat(estadoEnviadoAGuardar.getNombre()).isEqualTo("PENDIENTE");
        assertThat(estadoEnviadoAGuardar.getDescripcion()).isEqualTo("Consulta creada y pendiente de respuesta");

        assertThat(response.getIdEstadoConsulta()).isEqualTo(1L);
        assertThat(response.getNombre()).isEqualTo("PENDIENTE");
        assertThat(response.getDescripcion()).isEqualTo("Consulta creada y pendiente de respuesta");
        assertThat(response.getCreatedAt()).isEqualTo(estadoGuardado.getCreatedAt());
        assertThat(response.getUpdatedAt()).isEqualTo(estadoGuardado.getUpdatedAt());
    }

    @Test
    void obtenerEstadosConsulta_debeRetornarListaMapeada() {
        EstadoConsulta pendiente = nuevoEstado(1L, "PENDIENTE", "Pendiente");
        EstadoConsulta respondida = nuevoEstado(2L, "RESPONDIDA", "Respondida");
        when(estadoConsultaRepository.findAll()).thenReturn(List.of(pendiente, respondida));

        List<EstadoConsultaResponse> responses = estadoConsultaService.obtenerEstadosConsulta();

        verify(estadoConsultaRepository).findAll();
        assertThat(responses).hasSize(2);
        assertThat(responses).extracting(EstadoConsultaResponse::getIdEstadoConsulta).containsExactly(1L, 2L);
        assertThat(responses).extracting(EstadoConsultaResponse::getNombre).containsExactly("PENDIENTE", "RESPONDIDA");
    }

    @Test
    void obtenerEstadoConsulta_cuandoExiste_debeRetornarResponseMapeado() {
        EstadoConsulta estado = nuevoEstado(3L, "CERRADA", "Consulta cerrada");
        when(estadoConsultaRepository.findById(3L)).thenReturn(Optional.of(estado));

        EstadoConsultaResponse response = estadoConsultaService.obtenerEstadoConsulta(3L);

        assertThat(response.getIdEstadoConsulta()).isEqualTo(3L);
        assertThat(response.getNombre()).isEqualTo("CERRADA");
        assertThat(response.getDescripcion()).isEqualTo("Consulta cerrada");
    }

    @Test
    void obtenerEstadoConsulta_cuandoNoExiste_debeLanzarExcepcion() {
        when(estadoConsultaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> estadoConsultaService.obtenerEstadoConsulta(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Estado de consulta no encontrado");
    }

    @Test
    void actualizarEstadoConsulta_cuandoExiste_debeModificarYGuardarEstado() {
        EstadoConsulta estadoActual = nuevoEstado(4L, "PENDIENTE", "Pendiente");
        EstadoConsultaRequest request = nuevoEstadoRequest("RESPONDIDA", "Consulta respondida por el almacén");

        when(estadoConsultaRepository.findById(4L)).thenReturn(Optional.of(estadoActual));
        when(estadoConsultaRepository.save(any(EstadoConsulta.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EstadoConsultaResponse response = estadoConsultaService.actualizarEstadoConsulta(4L, request);

        ArgumentCaptor<EstadoConsulta> estadoCaptor = ArgumentCaptor.forClass(EstadoConsulta.class);
        verify(estadoConsultaRepository).save(estadoCaptor.capture());

        EstadoConsulta estadoActualizado = estadoCaptor.getValue();
        assertThat(estadoActualizado.getNombre()).isEqualTo("RESPONDIDA");
        assertThat(estadoActualizado.getDescripcion()).isEqualTo("Consulta respondida por el almacén");
        assertThat(response.getNombre()).isEqualTo("RESPONDIDA");
        assertThat(response.getDescripcion()).isEqualTo("Consulta respondida por el almacén");
    }

    @Test
    void actualizarEstadoConsulta_cuandoNoExiste_debeLanzarExcepcionYNoGuardar() {
        EstadoConsultaRequest request = nuevoEstadoRequest("RESPONDIDA", "Consulta respondida");
        when(estadoConsultaRepository.findById(50L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> estadoConsultaService.actualizarEstadoConsulta(50L, request))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Estado de consulta no encontrado");

        verify(estadoConsultaRepository, never()).save(any(EstadoConsulta.class));
    }

    @Test
    void eliminarEstadoConsulta_cuandoExiste_debeEliminarPorId() {
        when(estadoConsultaRepository.existsById(6L)).thenReturn(true);

        estadoConsultaService.eliminarEstadoConsulta(6L);

        verify(estadoConsultaRepository).existsById(6L);
        verify(estadoConsultaRepository).deleteById(6L);
    }

    @Test
    void eliminarEstadoConsulta_cuandoNoExiste_debeLanzarExcepcionYNoEliminar() {
        when(estadoConsultaRepository.existsById(60L)).thenReturn(false);

        assertThatThrownBy(() -> estadoConsultaService.eliminarEstadoConsulta(60L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Estado de consulta no encontrado");

        verify(estadoConsultaRepository, never()).deleteById(60L);
    }

    private EstadoConsultaRequest nuevoEstadoRequest(String nombre, String descripcion) {
        EstadoConsultaRequest request = new EstadoConsultaRequest();
        request.setNombre(nombre);
        request.setDescripcion(descripcion);
        return request;
    }

    private EstadoConsulta nuevoEstado(Long id, String nombre, String descripcion) {
        LocalDateTime now = LocalDateTime.of(2026, 5, 13, 12, 0);
        EstadoConsulta estado = new EstadoConsulta();
        estado.setIdEstadoConsulta(id);
        estado.setNombre(nombre);
        estado.setDescripcion(descripcion);
        estado.setCreatedAt(now);
        estado.setUpdatedAt(now.plusMinutes(10));
        return estado;
    }
}
