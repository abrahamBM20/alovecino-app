package com.alovecino.consultaservice.controller;

import com.alovecino.consultaservice.dto.ConsultaRequest;
import com.alovecino.consultaservice.dto.ConsultaResponse;
import com.alovecino.consultaservice.dto.DashboardAlmacenResponse;
import com.alovecino.consultaservice.dto.ResponderConsultaRequest;
import com.alovecino.consultaservice.service.ConsultaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ConsultaControllerTest {

    @Mock
    private ConsultaService consultaService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders
                .standaloneSetup(new ConsultaController(consultaService))
                .setValidator(validator)
                .build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void crearConsulta_conRequestValido_debeRetornar201YBody() throws Exception {
        ConsultaRequest request = requestValido();
        ConsultaResponse response = responseConsulta(1L, request.getDescripcion(), request.getCantidad(),
                request.getIdCliente(), request.getIdAlmacen(), null, 1L);

        when(consultaService.crearConsulta(org.mockito.ArgumentMatchers.any(ConsultaRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/consultas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idConsulta").value(1))
                .andExpect(jsonPath("$.descripcion").value("Necesito consultar stock"))
                .andExpect(jsonPath("$.cantidad").value(2))
                .andExpect(jsonPath("$.idCliente").value(10))
                .andExpect(jsonPath("$.idAlmacen").value(20))
                .andExpect(jsonPath("$.idEstadoConsulta").value(1));

        ArgumentCaptor<ConsultaRequest> requestCaptor = ArgumentCaptor.forClass(ConsultaRequest.class);
        verify(consultaService).crearConsulta(requestCaptor.capture());
        assertThat(requestCaptor.getValue().getDescripcion()).isEqualTo("Necesito consultar stock");
    }

    @Test
    void crearConsulta_conDescripcionVacia_debeRetornar400() throws Exception {
        ConsultaRequest request = requestValido();
        request.setDescripcion(" ");

        mockMvc.perform(post("/api/consultas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void obtenerConsulta_debeRetornar200YConsulta() throws Exception {
        ConsultaResponse response = responseConsulta(5L, "Consulta existente", 3, 30L, 40L, null, 1L);
        when(consultaService.obtenerConsulta(5L)).thenReturn(response);

        mockMvc.perform(get("/api/consultas/{id}", 5L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idConsulta").value(5))
                .andExpect(jsonPath("$.descripcion").value("Consulta existente"));

        verify(consultaService).obtenerConsulta(5L);
    }

    @Test
    void obtenerConsultasPorCliente_debeRetornar200YLista() throws Exception {
        when(consultaService.obtenerConsultasPorCliente(10L)).thenReturn(List.of(
                responseConsulta(1L, "Consulta 1", 1, 10L, 20L, null, 1L),
                responseConsulta(2L, "Consulta 2", 2, 10L, 21L, "Disponible", 2L)
        ));

        mockMvc.perform(get("/api/consultas/cliente/{idCliente}", 10L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].idConsulta").value(1))
                .andExpect(jsonPath("$[1].idConsulta").value(2))
                .andExpect(jsonPath("$[1].respuesta").value("Disponible"));

        verify(consultaService).obtenerConsultasPorCliente(10L);
    }

    @Test
    void obtenerConsultasPorAlmacen_debeRetornar200YLista() throws Exception {
        when(consultaService.obtenerConsultasPorAlmacen("99", 20L)).thenReturn(List.of(
                responseConsulta(1L, "Consulta 1", 1, 10L, 20L, null, 1L)
        ));

        mockMvc.perform(get("/api/consultas/almacen/{idAlmacen}", 20L)
                        .principal(() -> "99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].idAlmacen").value(20));

        verify(consultaService).obtenerConsultasPorAlmacen("99", 20L);
    }

    @Test
    void obtenerDashboardAlmacen_debeRetornar200YMetricas() throws Exception {
        DashboardAlmacenResponse response = new DashboardAlmacenResponse();
        response.setIdAlmacen(20L);
        response.setTotalConsultas(3);
        response.setPendientes(1);
        response.setRespondidas(2);
        response.setConsultasRecientes(List.of(
                responseConsulta(1L, "Consulta 1", 1, 10L, 20L, null, 1L)
        ));
        when(consultaService.obtenerDashboardAlmacen("99", 20L)).thenReturn(response);

        mockMvc.perform(get("/api/consultas/almacen/{idAlmacen}/dashboard", 20L)
                        .principal(() -> "99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idAlmacen").value(20))
                .andExpect(jsonPath("$.totalConsultas").value(3))
                .andExpect(jsonPath("$.pendientes").value(1))
                .andExpect(jsonPath("$.respondidas").value(2))
                .andExpect(jsonPath("$.consultasRecientes[0].idConsulta").value(1));

        verify(consultaService).obtenerDashboardAlmacen("99", 20L);
    }

    @Test
    void responderConsulta_debeRetornar200YRespuestaActualizada() throws Exception {
        ResponderConsultaRequest requestDTO = new ResponderConsultaRequest();
        requestDTO.setRespuesta("Sí, tenemos stock");
        requestDTO.setIdEstadoConsulta(2L);
        
        ConsultaResponse response = responseConsulta(7L, "Consulta pendiente", 4, 11L, 22L,
                "Sí, tenemos stock", 2L);
        when(consultaService.responderConsulta(org.mockito.ArgumentMatchers.eq("99"),
                org.mockito.ArgumentMatchers.eq(7L),
                org.mockito.ArgumentMatchers.any(ResponderConsultaRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/consultas/{id}/responder", 7L)
                        .principal(() -> "99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idConsulta").value(7))
                .andExpect(jsonPath("$.respuesta").value("Sí, tenemos stock"))
                .andExpect(jsonPath("$.idEstadoConsulta").value(2));

        ArgumentCaptor<ResponderConsultaRequest> requestCaptor = ArgumentCaptor.forClass(ResponderConsultaRequest.class);
        verify(consultaService).responderConsulta(org.mockito.ArgumentMatchers.eq("99"),
                org.mockito.ArgumentMatchers.eq(7L), requestCaptor.capture());
        assertThat(requestCaptor.getValue().getRespuesta()).isEqualTo("Sí, tenemos stock");
    }

    @Test
    void actualizarEstadoConsulta_debeRetornar200YEstadoActualizado() throws Exception {
        ConsultaResponse response = responseConsulta(9L, "Consulta", 1, 11L, 22L, null, 3L);
        when(consultaService.actualizarEstadoConsulta("99", 9L, 3L)).thenReturn(response);

        mockMvc.perform(put("/api/consultas/{id}/estado", 9L)
                        .principal(new UsernamePasswordAuthenticationToken("99", "n/a",
                                List.of(new SimpleGrantedAuthority("ROLE_ALMACEN"))))
                        .param("idEstadoConsulta", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idConsulta").value(9))
                .andExpect(jsonPath("$.idEstadoConsulta").value(3));

        verify(consultaService).actualizarEstadoConsulta("99", 9L, 3L);
    }

    @Test
    void actualizarEstadoConsulta_comoClienteDebeMantenerContratoAnterior() throws Exception {
        ConsultaResponse response = responseConsulta(9L, "Consulta", 1, 11L, 22L, null, 3L);
        when(consultaService.actualizarEstadoConsulta(9L, 3L)).thenReturn(response);

        mockMvc.perform(put("/api/consultas/{id}/estado", 9L)
                        .principal(new UsernamePasswordAuthenticationToken("55", "n/a",
                                List.of(new SimpleGrantedAuthority("ROLE_CLIENTE"))))
                        .param("idEstadoConsulta", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idConsulta").value(9))
                .andExpect(jsonPath("$.idEstadoConsulta").value(3));

        verify(consultaService).actualizarEstadoConsulta(9L, 3L);
    }

    private ConsultaRequest requestValido() {
        ConsultaRequest request = new ConsultaRequest();
        request.setDescripcion("Necesito consultar stock");
        request.setCantidad(2);
        request.setIdCliente(10L);
        request.setIdAlmacen(20L);
        request.setIdEstadoConsulta(1L);
        return request;
    }

    private ConsultaResponse responseConsulta(Long idConsulta, String descripcion, Integer cantidad, Long idCliente,
                                              Long idAlmacen, String respuesta, Long idEstadoConsulta) {
        ConsultaResponse response = new ConsultaResponse();
        response.setIdConsulta(idConsulta);
        response.setDescripcion(descripcion);
        response.setCantidad(cantidad);
        response.setIdCliente(idCliente);
        response.setIdAlmacen(idAlmacen);
        response.setRespuesta(respuesta);
        response.setIdEstadoConsulta(idEstadoConsulta);
        return response;
    }
}
