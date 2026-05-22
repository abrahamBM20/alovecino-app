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
class ConsultaServiceTest {

    @Mock
    private ConsultaRepository consultaRepository;

    @Mock
    private EstadoConsultaRepository estadoConsultaRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private AlmacenRepository almacenRepository;

    @InjectMocks
    private ConsultaService consultaService;

    @Test
    void crearConsulta_debeAsignarEstadoPendienteEIgnorarRespuestaYEstadoDelRequest() {
        ConsultaRequest request = nuevaConsultaRequest();
        request.setRespuesta("Respuesta enviada indebidamente desde frontend");
        request.setIdEstadoConsulta(999L);

        EstadoConsulta estadoPendiente = nuevoEstado(1L, "PENDIENTE");
        Consulta consultaGuardada = nuevaConsulta(10L, request.getDescripcion(), request.getCantidad(),
                request.getIdCliente(), request.getIdAlmacen(), null, 1L);

        when(clienteRepository.existsById(5L)).thenReturn(true);
        when(almacenRepository.existsById(7L)).thenReturn(true);
        when(estadoConsultaRepository.findByNombre("PENDIENTE")).thenReturn(estadoPendiente);
        when(consultaRepository.save(any(Consulta.class))).thenReturn(consultaGuardada);

        ConsultaResponse response = consultaService.crearConsulta(request);

        ArgumentCaptor<Consulta> consultaCaptor = ArgumentCaptor.forClass(Consulta.class);
        verify(consultaRepository).save(consultaCaptor.capture());

        Consulta consultaEnviadaAGuardar = consultaCaptor.getValue();
        assertThat(consultaEnviadaAGuardar.getDescripcion()).isEqualTo(request.getDescripcion());
        assertThat(consultaEnviadaAGuardar.getCantidad()).isEqualTo(request.getCantidad());
        assertThat(consultaEnviadaAGuardar.getIdCliente()).isEqualTo(request.getIdCliente());
        assertThat(consultaEnviadaAGuardar.getIdAlmacen()).isEqualTo(request.getIdAlmacen());
        assertThat(consultaEnviadaAGuardar.getRespuesta()).isNull();
        assertThat(consultaEnviadaAGuardar.getIdEstadoConsulta()).isEqualTo(1L);

        assertThat(response.getIdConsulta()).isEqualTo(10L);
        assertThat(response.getRespuesta()).isNull();
        assertThat(response.getIdEstadoConsulta()).isEqualTo(1L);
    }

    @Test
    void crearConsulta_sinEstadoPendiente_debeLanzarExcepcionYNoGuardar() {
        ConsultaRequest request = nuevaConsultaRequest();
        when(clienteRepository.existsById(5L)).thenReturn(true);
        when(almacenRepository.existsById(7L)).thenReturn(true);
        when(estadoConsultaRepository.findByNombre("PENDIENTE")).thenReturn(null);

        assertThatThrownBy(() -> consultaService.crearConsulta(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("El estado PENDIENTE no está configurado en el sistema");

        verify(consultaRepository, never()).save(any(Consulta.class));
    }

    @Test
    void crearConsulta_cuandoClienteNoExiste_debeLanzarExcepcionYNoGuardar() {
        ConsultaRequest request = nuevaConsultaRequest();
        when(clienteRepository.existsById(5L)).thenReturn(false);

        assertThatThrownBy(() -> consultaService.crearConsulta(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("El cliente no existe");

        verify(consultaRepository, never()).save(any(Consulta.class));
        verify(estadoConsultaRepository, never()).findByNombre("PENDIENTE");
    }

    @Test
    void crearConsulta_cuandoAlmacenNoExiste_debeLanzarExcepcionYNoGuardar() {
        ConsultaRequest request = nuevaConsultaRequest();
        when(clienteRepository.existsById(5L)).thenReturn(true);
        when(almacenRepository.existsById(7L)).thenReturn(false);

        assertThatThrownBy(() -> consultaService.crearConsulta(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("El almacén no existe");

        verify(consultaRepository, never()).save(any(Consulta.class));
        verify(estadoConsultaRepository, never()).findByNombre("PENDIENTE");
    }

    @Test
    void obtenerConsulta_cuandoExiste_debeRetornarConsultaMapeada() {
        Consulta consulta = nuevaConsulta(1L, "Necesito arroz", 3, 5L, 7L, null, 1L);
        when(consultaRepository.findById(1L)).thenReturn(Optional.of(consulta));

        ConsultaResponse response = consultaService.obtenerConsulta(1L);

        assertThat(response.getIdConsulta()).isEqualTo(1L);
        assertThat(response.getDescripcion()).isEqualTo("Necesito arroz");
        assertThat(response.getCantidad()).isEqualTo(3);
        assertThat(response.getIdCliente()).isEqualTo(5L);
        assertThat(response.getIdAlmacen()).isEqualTo(7L);
        assertThat(response.getIdEstadoConsulta()).isEqualTo(1L);
    }

    @Test
    void obtenerConsulta_cuandoNoExiste_debeLanzarExcepcion() {
        when(consultaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> consultaService.obtenerConsulta(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Consulta no encontrada");
    }

    @Test
    void obtenerConsultasPorCliente_debeRetornarListaMapeada() {
        Consulta consultaUno = nuevaConsulta(1L, "Consulta 1", 1, 11L, 21L, null, 1L);
        Consulta consultaDos = nuevaConsulta(2L, "Consulta 2", 2, 11L, 22L, "Disponible", 2L);
        when(consultaRepository.findConsultasByCliente(11L)).thenReturn(List.of(consultaUno, consultaDos));

        List<ConsultaResponse> responses = consultaService.obtenerConsultasPorCliente(11L);

        verify(consultaRepository).findConsultasByCliente(11L);
        assertThat(responses).hasSize(2);
        assertThat(responses).extracting(ConsultaResponse::getIdConsulta).containsExactly(1L, 2L);
        assertThat(responses).extracting(ConsultaResponse::getDescripcion).containsExactly("Consulta 1", "Consulta 2");
    }

    @Test
    void obtenerConsultasPorAlmacen_debeRetornarListaMapeada() {
        Consulta consultaUno = nuevaConsulta(1L, "Consulta A", 4, 31L, 41L, null, 1L);
        Consulta consultaDos = nuevaConsulta(2L, "Consulta B", 5, 32L, 41L, "No disponible", 3L);
        when(consultaRepository.findConsultasByAlmacen(41L)).thenReturn(List.of(consultaUno, consultaDos));

        List<ConsultaResponse> responses = consultaService.obtenerConsultasPorAlmacen(41L);

        verify(consultaRepository).findConsultasByAlmacen(41L);
        assertThat(responses).hasSize(2);
        assertThat(responses).extracting(ConsultaResponse::getIdAlmacen).containsOnly(41L);
        assertThat(responses).extracting(ConsultaResponse::getRespuesta).containsExactly(null, "No disponible");
    }

    @Test
    void responderConsulta_cuandoExiste_debeGuardarRespuestaFechaYEstado() {
        Consulta consulta = nuevaConsulta(8L, "Consulta pendiente", 1, 15L, 25L, null, 1L);
        EstadoConsulta estadoRespondida = nuevoEstado(2L, "RESPONDIDA");
        ResponderConsultaRequest request = nuevaResponderRequest("Sí, tenemos stock", 2L);

        when(consultaRepository.findById(8L)).thenReturn(Optional.of(consulta));
        when(estadoConsultaRepository.findById(2L)).thenReturn(Optional.of(estadoRespondida));
        when(consultaRepository.save(any(Consulta.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ConsultaResponse response = consultaService.responderConsulta(8L, request);

        ArgumentCaptor<Consulta> consultaCaptor = ArgumentCaptor.forClass(Consulta.class);
        verify(consultaRepository).save(consultaCaptor.capture());

        Consulta consultaActualizada = consultaCaptor.getValue();
        assertThat(consultaActualizada.getRespuesta()).isEqualTo("Sí, tenemos stock");
        assertThat(consultaActualizada.getIdEstadoConsulta()).isEqualTo(2L);
        assertThat(consultaActualizada.getFechaRespuesta()).isNotNull();
        assertThat(consultaActualizada.getFechaRespuesta()).isBeforeOrEqualTo(LocalDateTime.now());

        assertThat(response.getRespuesta()).isEqualTo("Sí, tenemos stock");
        assertThat(response.getIdEstadoConsulta()).isEqualTo(2L);
        assertThat(response.getFechaRespuesta()).isNotNull();
    }

    @Test
    void responderConsulta_conRespuestaVacia_debeLanzarExcepcionSinConsultarBase() {
        ResponderConsultaRequest request = nuevaResponderRequest("   ", 2L);

        assertThatThrownBy(() -> consultaService.responderConsulta(1L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("La respuesta no puede estar vacía");

        verify(consultaRepository, never()).findById(any());
        verify(consultaRepository, never()).save(any(Consulta.class));
    }

    @Test
    void responderConsulta_cuandoNoExisteConsulta_debeLanzarExcepcionYNoGuardar() {
        ResponderConsultaRequest request = nuevaResponderRequest("Respuesta", 2L);
        when(consultaRepository.findById(123L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> consultaService.responderConsulta(123L, request))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Consulta no encontrada");

        verify(consultaRepository, never()).save(any(Consulta.class));
    }

    @Test
    void responderConsulta_cuandoNoExisteEstado_debeLanzarExcepcionYNoGuardar() {
        Consulta consulta = nuevaConsulta(8L, "Consulta", 1, 15L, 25L, null, 1L);
        ResponderConsultaRequest request = nuevaResponderRequest("Sí, tenemos", 99L);

        when(consultaRepository.findById(8L)).thenReturn(Optional.of(consulta));
        when(estadoConsultaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> consultaService.responderConsulta(8L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("El estado de consulta no existe");

        verify(consultaRepository, never()).save(any(Consulta.class));
    }

    @Test
    void actualizarEstadoConsulta_cuandoExiste_debeGuardarNuevoEstado() {
        Consulta consulta = nuevaConsulta(20L, "Consulta", 6, 10L, 11L, null, 1L);
        EstadoConsulta estadoCerrada = nuevoEstado(4L, "CERRADA");

        when(consultaRepository.findById(20L)).thenReturn(Optional.of(consulta));
        when(estadoConsultaRepository.findById(4L)).thenReturn(Optional.of(estadoCerrada));
        when(consultaRepository.save(any(Consulta.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ConsultaResponse response = consultaService.actualizarEstadoConsulta(20L, 4L);

        ArgumentCaptor<Consulta> consultaCaptor = ArgumentCaptor.forClass(Consulta.class);
        verify(consultaRepository).save(consultaCaptor.capture());

        assertThat(consultaCaptor.getValue().getIdEstadoConsulta()).isEqualTo(4L);
        assertThat(response.getIdEstadoConsulta()).isEqualTo(4L);
    }

    @Test
    void actualizarEstadoConsulta_cuandoNoExisteConsulta_debeLanzarExcepcionYNoGuardar() {
        when(consultaRepository.findById(222L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> consultaService.actualizarEstadoConsulta(222L, 4L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Consulta no encontrada");

        verify(consultaRepository, never()).save(any(Consulta.class));
    }

    @Test
    void actualizarEstadoConsulta_cuandoNoExisteEstado_debeLanzarExcepcionYNoGuardar() {
        Consulta consulta = nuevaConsulta(20L, "Consulta", 6, 10L, 11L, null, 1L);

        when(consultaRepository.findById(20L)).thenReturn(Optional.of(consulta));
        when(estadoConsultaRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> consultaService.actualizarEstadoConsulta(20L, 999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("El estado de consulta no existe");

        verify(consultaRepository, never()).save(any(Consulta.class));
    }

    private ConsultaRequest nuevaConsultaRequest() {
        ConsultaRequest request = new ConsultaRequest();
        request.setDescripcion("Necesito consultar disponibilidad de arroz");
        request.setCantidad(2);
        request.setIdCliente(5L);
        request.setIdAlmacen(7L);
        request.setIdEstadoConsulta(1L);
        return request;
    }

    private ResponderConsultaRequest nuevaResponderRequest(String respuesta, Long idEstadoConsulta) {
        ResponderConsultaRequest request = new ResponderConsultaRequest();
        request.setRespuesta(respuesta);
        request.setIdEstadoConsulta(idEstadoConsulta);
        return request;
    }

    private EstadoConsulta nuevoEstado(Long id, String nombre) {
        EstadoConsulta estado = new EstadoConsulta();
        estado.setIdEstadoConsulta(id);
        estado.setNombre(nombre);
        return estado;
    }

    private Consulta nuevaConsulta(Long idConsulta, String descripcion, Integer cantidad, Long idCliente,
                                   Long idAlmacen, String respuesta, Long idEstadoConsulta) {
        LocalDateTime now = LocalDateTime.of(2026, 5, 13, 10, 30);
        Consulta consulta = new Consulta();
        consulta.setIdConsulta(idConsulta);
        consulta.setDescripcion(descripcion);
        consulta.setCantidad(cantidad);
        consulta.setIdCliente(idCliente);
        consulta.setIdAlmacen(idAlmacen);
        consulta.setRespuesta(respuesta);
        consulta.setIdEstadoConsulta(idEstadoConsulta);
        consulta.setCreatedAt(now);
        consulta.setUpdatedAt(now.plusMinutes(5));
        return consulta;
    }
}
