package com.alovecino.consultaservice.controller;

import com.alovecino.consultaservice.dto.EstadoConsultaRequest;
import com.alovecino.consultaservice.dto.EstadoConsultaResponse;
import com.alovecino.consultaservice.service.EstadoConsultaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class EstadoConsultaControllerTest {

    @Mock
    private EstadoConsultaService estadoConsultaService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders
                .standaloneSetup(new EstadoConsultaController(estadoConsultaService))
                .setValidator(validator)
                .build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void crearEstadoConsulta_conRequestValido_debeRetornar201YBody() throws Exception {
        EstadoConsultaRequest request = requestValido("PENDIENTE", "Pendiente de respuesta");
        EstadoConsultaResponse response = responseEstado(1L, "PENDIENTE", "Pendiente de respuesta");
        when(estadoConsultaService.crearEstadoConsulta(org.mockito.ArgumentMatchers.any(EstadoConsultaRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/estados-consulta")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idEstadoConsulta").value(1))
                .andExpect(jsonPath("$.nombre").value("PENDIENTE"))
                .andExpect(jsonPath("$.descripcion").value("Pendiente de respuesta"));

        ArgumentCaptor<EstadoConsultaRequest> requestCaptor = ArgumentCaptor.forClass(EstadoConsultaRequest.class);
        verify(estadoConsultaService).crearEstadoConsulta(requestCaptor.capture());
        assertThat(requestCaptor.getValue().getNombre()).isEqualTo("PENDIENTE");
    }

    @Test
    void crearEstadoConsulta_conNombreVacio_debeRetornar400() throws Exception {
        EstadoConsultaRequest request = requestValido(" ", "Descripción");

        mockMvc.perform(post("/api/estados-consulta")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void obtenerEstadosConsulta_debeRetornar200YLista() throws Exception {
        when(estadoConsultaService.obtenerEstadosConsulta()).thenReturn(List.of(
                responseEstado(1L, "PENDIENTE", "Pendiente"),
                responseEstado(2L, "RESPONDIDA", "Respondida")
        ));

        mockMvc.perform(get("/api/estados-consulta"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("PENDIENTE"))
                .andExpect(jsonPath("$[1].nombre").value("RESPONDIDA"));

        verify(estadoConsultaService).obtenerEstadosConsulta();
    }

    @Test
    void obtenerEstadoConsulta_debeRetornar200YEstado() throws Exception {
        when(estadoConsultaService.obtenerEstadoConsulta(2L))
                .thenReturn(responseEstado(2L, "RESPONDIDA", "Respondida"));

        mockMvc.perform(get("/api/estados-consulta/{id}", 2L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idEstadoConsulta").value(2))
                .andExpect(jsonPath("$.nombre").value("RESPONDIDA"));

        verify(estadoConsultaService).obtenerEstadoConsulta(2L);
    }

    @Test
    void actualizarEstadoConsulta_conRequestValido_debeRetornar200YBodyActualizado() throws Exception {
        EstadoConsultaRequest request = requestValido("CERRADA", "Consulta cerrada");
        when(estadoConsultaService.actualizarEstadoConsulta(org.mockito.ArgumentMatchers.eq(3L),
                org.mockito.ArgumentMatchers.any(EstadoConsultaRequest.class)))
                .thenReturn(responseEstado(3L, "CERRADA", "Consulta cerrada"));

        mockMvc.perform(put("/api/estados-consulta/{id}", 3L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idEstadoConsulta").value(3))
                .andExpect(jsonPath("$.nombre").value("CERRADA"));

        verify(estadoConsultaService).actualizarEstadoConsulta(org.mockito.ArgumentMatchers.eq(3L),
                org.mockito.ArgumentMatchers.any(EstadoConsultaRequest.class));
    }

    @Test
    void eliminarEstadoConsulta_debeRetornar204() throws Exception {
        mockMvc.perform(delete("/api/estados-consulta/{id}", 4L))
                .andExpect(status().isNoContent());

        verify(estadoConsultaService).eliminarEstadoConsulta(4L);
    }

    private EstadoConsultaRequest requestValido(String nombre, String descripcion) {
        EstadoConsultaRequest request = new EstadoConsultaRequest();
        request.setNombre(nombre);
        request.setDescripcion(descripcion);
        return request;
    }

    private EstadoConsultaResponse responseEstado(Long id, String nombre, String descripcion) {
        EstadoConsultaResponse response = new EstadoConsultaResponse();
        response.setIdEstadoConsulta(id);
        response.setNombre(nombre);
        response.setDescripcion(descripcion);
        return response;
    }
}
