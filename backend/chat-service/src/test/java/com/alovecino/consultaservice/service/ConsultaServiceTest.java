package com.alovecino.consultaservice.service;

import com.alovecino.consultaservice.dto.ConsultaRequest;
import com.alovecino.consultaservice.dto.ConsultaDetalleRequest;
import com.alovecino.consultaservice.dto.ConsultaResponse;
import com.alovecino.consultaservice.dto.DashboardAlmacenResponse;
import com.alovecino.consultaservice.dto.ResponderConsultaRequest;
import com.alovecino.consultaservice.model.Almacen;
import com.alovecino.consultaservice.model.Consulta;
import com.alovecino.consultaservice.model.ConsultaDetalle;
import com.alovecino.consultaservice.model.EstadoConsulta;
import com.alovecino.consultaservice.repository.AlmacenRepository;
import com.alovecino.consultaservice.repository.ClienteRepository;
import com.alovecino.consultaservice.repository.ConsultaRepository;
import com.alovecino.consultaservice.repository.EstadoConsultaRepository;
import com.alovecino.consultaservice.repository.UsuarioRepository;
import org.springframework.security.access.AccessDeniedException;
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

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private ConsultaService consultaService;

    @Test
    void crearConsulta_debeAsignarEstadoPendienteYGuardarDetallesMer() {
        ConsultaRequest request = nuevaConsultaRequest();

        EstadoConsulta estadoPendiente = nuevoEstado(1L, "PENDIENTE");
        Consulta consultaGuardada = nuevaConsulta(10L, "Necesito consultar disponibilidad de arroz", 2,
                request.getIdCliente(), request.getIdAlmacen(), null, 1L);

        when(clienteRepository.existsById(5L)).thenReturn(true);
        when(almacenRepository.existsById(7L)).thenReturn(true);
        when(estadoConsultaRepository.findByNombre("PENDIENTE")).thenReturn(estadoPendiente);
        when(consultaRepository.save(any(Consulta.class))).thenReturn(consultaGuardada);

        ConsultaResponse response = consultaService.crearConsulta(request);

        ArgumentCaptor<Consulta> consultaCaptor = ArgumentCaptor.forClass(Consulta.class);
        verify(consultaRepository).save(consultaCaptor.capture());

        Consulta consultaEnviadaAGuardar = consultaCaptor.getValue();
        assertThat(consultaEnviadaAGuardar.getDetalles()).hasSize(1);
        assertThat(consultaEnviadaAGuardar.getDetalles().get(0).getDescripcion())
                .isEqualTo("Necesito consultar disponibilidad de arroz");
        assertThat(consultaEnviadaAGuardar.getDetalles().get(0).getCantidadSolicitada()).isEqualTo(2);
        assertThat(consultaEnviadaAGuardar.getIdCliente()).isEqualTo(request.getIdCliente());
        assertThat(consultaEnviadaAGuardar.getIdAlmacen()).isEqualTo(request.getIdAlmacen());
        assertThat(consultaEnviadaAGuardar.getRespuesta()).isNull();
        assertThat(consultaEnviadaAGuardar.getIdEstadoConsulta()).isEqualTo(1L);

        assertThat(response.getIdConsulta()).isEqualTo(10L);
        assertThat(response.getDetalles()).hasSize(1);
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
    void crearConsulta_conMultiplesDetalles_debePersistirDetalleEnTablaSeparada() {
        ConsultaRequest request = new ConsultaRequest();
        request.setIdCliente(5L);
        request.setIdAlmacen(7L);
        request.setDetalles(List.of(
                nuevoDetalleRequest("Necesito leche", 4),
                nuevoDetalleRequest("Necesito pan", 2)));

        EstadoConsulta estadoPendiente = nuevoEstado(1L, "PENDIENTE");
        when(clienteRepository.existsById(5L)).thenReturn(true);
        when(almacenRepository.existsById(7L)).thenReturn(true);
        when(estadoConsultaRepository.findByNombre("PENDIENTE")).thenReturn(estadoPendiente);
        when(consultaRepository.save(any(Consulta.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ConsultaResponse response = consultaService.crearConsulta(request);

        ArgumentCaptor<Consulta> consultaCaptor = ArgumentCaptor.forClass(Consulta.class);
        verify(consultaRepository).save(consultaCaptor.capture());
        Consulta consulta = consultaCaptor.getValue();

        assertThat(consulta.getDetalles()).hasSize(2);
        assertThat(consulta.getDetalles().get(0).getConsulta()).isSameAs(consulta);
        assertThat(response.getDetalles()).hasSize(2);
        assertThat(response.getDetalles())
                .extracting("descripcion")
                .containsExactly("Necesito leche", "Necesito pan");
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
        assertThat(response.getDetalles()).hasSize(1);
        assertThat(response.getDetalles().get(0).getDescripcion()).isEqualTo("Necesito arroz");
        assertThat(response.getDetalles().get(0).getCantidadSolicitada()).isEqualTo(3);
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
        assertThat(responses.get(0).getDetalles().get(0).getDescripcion()).isEqualTo("Consulta 1");
        assertThat(responses.get(1).getDetalles().get(0).getDescripcion()).isEqualTo("Consulta 2");
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
    void responderConsulta_sinEstadoDebeUsarRespondidaPorDefecto() {
        Consulta consulta = nuevaConsulta(8L, "Consulta pendiente", 1, 15L, 25L, null, 1L);
        EstadoConsulta estadoRespondida = nuevoEstado(2L, "RESPONDIDA");
        ResponderConsultaRequest request = nuevaResponderRequest("Sí, tenemos stock", null);

        when(consultaRepository.findById(8L)).thenReturn(Optional.of(consulta));
        when(estadoConsultaRepository.findByNombre("RESPONDIDA")).thenReturn(estadoRespondida);
        when(consultaRepository.save(any(Consulta.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ConsultaResponse response = consultaService.responderConsulta(8L, request);

        assertThat(response.getIdEstadoConsulta()).isEqualTo(2L);
        verify(estadoConsultaRepository).findByNombre("RESPONDIDA");
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

    @Test
    void obtenerDashboardAlmacen_debeValidarDuenoYCalcularIndicadoresReales() {
        Almacen almacen = nuevoAlmacen(41L, 99L);
        EstadoConsulta pendiente = nuevoEstado(1L, "PENDIENTE");
        EstadoConsulta respondida = nuevoEstado(2L, "RESPONDIDA");
        EstadoConsulta cerrada = nuevoEstado(3L, "CERRADA");
        Consulta consultaPendiente = nuevaConsulta(1L, "Consulta A", 4, 31L, 41L, null, 1L);
        consultaPendiente.setCreatedAt(LocalDateTime.now().minusHours(1));
        Consulta consultaRespondida = nuevaConsulta(2L, "Consulta B", 5, 32L, 41L, "Disponible", 2L);
        consultaRespondida.setCreatedAt(LocalDateTime.now().minusHours(2));
        consultaRespondida.setFechaRespuesta(LocalDateTime.now().minusHours(1));

        when(almacenRepository.findById(41L)).thenReturn(Optional.of(almacen));
        when(consultaRepository.findConsultasByAlmacen(41L)).thenReturn(List.of(consultaPendiente, consultaRespondida));
        when(estadoConsultaRepository.findById(1L)).thenReturn(Optional.of(pendiente));
        when(estadoConsultaRepository.findById(2L)).thenReturn(Optional.of(respondida));
        when(estadoConsultaRepository.findAll()).thenReturn(List.of(pendiente, respondida, cerrada));

        DashboardAlmacenResponse response = consultaService.obtenerDashboardAlmacen("99", 41L);

        assertThat(response.getIdAlmacen()).isEqualTo(41L);
        assertThat(response.getTotalConsultas()).isEqualTo(2);
        assertThat(response.getConsultasHoy()).isEqualTo(2);
        assertThat(response.getPendientes()).isEqualTo(1);
        assertThat(response.getRespondidas()).isEqualTo(1);
        assertThat(response.getCerradas()).isZero();
        assertThat(response.getTiempoPromedioMin()).isEqualTo(60L);
        assertThat(response.getConsultasRecientes()).hasSize(2);
    }

    @Test
    void obtenerConsultasPorAlmacen_cuandoNoEsDueno_debeDenegarAcceso() {
        when(almacenRepository.findById(41L)).thenReturn(Optional.of(nuevoAlmacen(41L, 99L)));

        assertThatThrownBy(() -> consultaService.obtenerConsultasPorAlmacen("100", 41L))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("No tienes permiso para operar sobre este almacén");

        verify(consultaRepository, never()).findConsultasByAlmacen(41L);
    }

    private ConsultaRequest nuevaConsultaRequest() {
        ConsultaRequest request = new ConsultaRequest();
        request.setIdCliente(5L);
        request.setIdAlmacen(7L);
        request.setDetalles(List.of(nuevoDetalleRequest("Necesito consultar disponibilidad de arroz", 2)));
        return request;
    }

    private ResponderConsultaRequest nuevaResponderRequest(String respuesta, Long idEstadoConsulta) {
        ResponderConsultaRequest request = new ResponderConsultaRequest();
        request.setRespuesta(respuesta);
        request.setIdEstadoConsulta(idEstadoConsulta);
        return request;
    }

    private ConsultaDetalleRequest nuevoDetalleRequest(String descripcion, Integer cantidadSolicitada) {
        ConsultaDetalleRequest request = new ConsultaDetalleRequest();
        request.setDescripcion(descripcion);
        request.setCantidadSolicitada(cantidadSolicitada);
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
        consulta.setIdCliente(idCliente);
        consulta.setIdAlmacen(idAlmacen);
        consulta.setRespuesta(respuesta);
        consulta.setIdEstadoConsulta(idEstadoConsulta);
        consulta.setCreatedAt(now);
        consulta.setUpdatedAt(now.plusMinutes(5));
        ConsultaDetalle detalle = new ConsultaDetalle();
        detalle.setIdConsultaDetalle(idConsulta * 10);
        detalle.setDescripcion(descripcion);
        detalle.setCantidadSolicitada(cantidad);
        detalle.setCreatedAt(now);
        detalle.setUpdatedAt(now.plusMinutes(5));
        consulta.addDetalle(detalle);
        return consulta;
    }

    private Almacen nuevoAlmacen(Long idAlmacen, Long idUsuario) {
        Almacen almacen = new Almacen();
        almacen.setIdAlmacen(idAlmacen);
        almacen.setIdUsuario(idUsuario);
        almacen.setNombre("Almacén Test");
        return almacen;
    }
}
