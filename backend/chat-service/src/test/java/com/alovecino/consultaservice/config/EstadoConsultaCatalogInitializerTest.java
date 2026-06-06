package com.alovecino.consultaservice.config;

import com.alovecino.consultaservice.model.EstadoConsulta;
import com.alovecino.consultaservice.repository.EstadoConsultaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.ApplicationRunner;

import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EstadoConsultaCatalogInitializerTest {

    @Test
    void inicializarCatalogoEstadosConsulta_debeCrearEstadosFaltantes() throws Exception {
        EstadoConsultaRepository repository = mock(EstadoConsultaRepository.class);
        ApplicationRunner runner = new EstadoConsultaCatalogInitializer()
                .inicializarCatalogoEstadosConsulta(repository);

        runner.run(null);

        verify(repository).save(argThat(estado -> "PENDIENTE".equals(estado.getCodigo())
                && "PENDIENTE".equals(estado.getNombre())));
        verify(repository).save(argThat(estado -> "RESPONDIDA".equals(estado.getCodigo())
                && "RESPONDIDA".equals(estado.getNombre())));
        verify(repository).save(argThat(estado -> "CERRADA".equals(estado.getCodigo())
                && "CERRADA".equals(estado.getNombre())));
        verify(repository).save(argThat(estado -> "CANCELADA".equals(estado.getCodigo())
                && "CANCELADA".equals(estado.getNombre())));
    }

    @Test
    void inicializarCatalogoEstadosConsulta_noDebeDuplicarEstadosExistentes() throws Exception {
        EstadoConsultaRepository repository = mock(EstadoConsultaRepository.class);
        when(repository.findByCodigo("PENDIENTE")).thenReturn(estadoExistente("PENDIENTE"));
        when(repository.findByCodigo("RESPONDIDA")).thenReturn(estadoExistente("RESPONDIDA"));
        when(repository.findByCodigo("CERRADA")).thenReturn(estadoExistente("CERRADA"));
        when(repository.findByCodigo("CANCELADA")).thenReturn(estadoExistente("CANCELADA"));
        ApplicationRunner runner = new EstadoConsultaCatalogInitializer()
                .inicializarCatalogoEstadosConsulta(repository);

        runner.run(null);

        verify(repository, never()).save(org.mockito.ArgumentMatchers.any(EstadoConsulta.class));
    }

    @Test
    void inicializarCatalogoEstadosConsulta_debeNormalizarNombreExistente() throws Exception {
        EstadoConsultaRepository repository = mock(EstadoConsultaRepository.class);
        EstadoConsulta pendiente = new EstadoConsulta();
        pendiente.setCodigo("PENDIENTE");
        pendiente.setNombre("Pendiente");
        when(repository.findByCodigo("PENDIENTE")).thenReturn(pendiente);
        when(repository.findByCodigo("RESPONDIDA")).thenReturn(estadoExistente("RESPONDIDA"));
        when(repository.findByCodigo("CERRADA")).thenReturn(estadoExistente("CERRADA"));
        when(repository.findByCodigo("CANCELADA")).thenReturn(estadoExistente("CANCELADA"));
        ApplicationRunner runner = new EstadoConsultaCatalogInitializer()
                .inicializarCatalogoEstadosConsulta(repository);

        runner.run(null);

        verify(repository).save(argThat(estado -> "PENDIENTE".equals(estado.getNombre())));
    }

    private EstadoConsulta estadoExistente(String codigo) {
        EstadoConsulta estado = new EstadoConsulta();
        estado.setCodigo(codigo);
        estado.setNombre(codigo);
        return estado;
    }
}
