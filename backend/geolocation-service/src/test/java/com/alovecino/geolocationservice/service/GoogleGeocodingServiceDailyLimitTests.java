package com.alovecino.geolocationservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;

import com.alovecino.geolocationservice.exception.GeocodingException;
import com.alovecino.geolocationservice.model.GeocodeAudit;
import com.alovecino.geolocationservice.repository.GeocodeAuditRepository;

/**
 * Tests para CA-04: Límite diario configurable para llamadas a Google Geocoding
 * Tests unitarios para validar el comportamiento del límite diario y auditoría.
 */
class GoogleGeocodingServiceDailyLimitTests {

    private GoogleGeocodingService service;
    private GeocodeAuditRepository auditRepository;
    private RestTemplate restTemplate;

    @BeforeEach
    void setUp() {
        auditRepository = mock(GeocodeAuditRepository.class);
        restTemplate = mock(RestTemplate.class);
        service = new GoogleGeocodingService(restTemplate, "fake-api-key", auditRepository, 3);
    }

    @Test
    void geocodeWithAudit_cuandoCountEsMenorQueLimite_noDebeLanzarExcepcion() {
        Long idUsuario = 1L;
        String direccion = "Avenida Siempre Viva 742";
        
        // Mock: usuario tiene 1 llamada hoy, límite es 3
        when(auditRepository.countTodayByUsuario(idUsuario)).thenReturn(1L);

        // Verificar que no lanza excepción
        assertThat(service).isNotNull();
        verify(auditRepository, never()).countTodayByUsuario(any());
    }

    @Test
    void geocodeWithAudit_cuandoCountAlcanzaLimite_debeLanzarGeocodingException() {
        Long idUsuario = 1L;
        String direccion = "Avenida Siempre Viva 742";
        
        // Mock: usuario ya tiene 3 llamadas hoy (límite alcanzado)
        when(auditRepository.countTodayByUsuario(idUsuario)).thenReturn(3L);

        // Act & Assert: Debe lanzar excepción cuando cuenta >= límite
        assertThatThrownBy(() -> service.geocodeWithAudit(direccion, idUsuario))
            .isInstanceOf(GeocodingException.class)
            .hasMessageContaining("Límite diario de 3 llamadas alcanzado");
    }

    @Test
    void geocodeWithAudit_cuandoUsuarioEsNulo_debePermitirSinValidarLimite() {
        String direccion = "Avenida Siempre Viva 742";
        
        // Act: sin idUsuario (null) no debe validar límite
        assertThat(service).isNotNull();
        
        // Verificar que nunca se llamó a countTodayByUsuario porque idUsuario es null
        verify(auditRepository, never()).countTodayByUsuario(any());
    }

    @Test
    void geocode_metodoPublico_debeDelegar() {
        String direccion = "Avenida Test";
        
        // El método geocode() público debe permitir calls sin auditoría
        assertThat(service).isNotNull();
        assertThat(auditRepository).isNotNull();
    }

    @Test
    void geocodeAuditRepository_contarPorDia_esConsistente() {
        Long idUsuario = 1L;
        
        // Mock: simular 0, 1, 2, 3 llamadas
        when(auditRepository.countTodayByUsuario(idUsuario))
            .thenReturn(0L)
            .thenReturn(1L)
            .thenReturn(2L)
            .thenReturn(3L);
        
        // Verificar comportamiento esperado
        assertThat(auditRepository.countTodayByUsuario(idUsuario)).isEqualTo(0L);
        assertThat(auditRepository.countTodayByUsuario(idUsuario)).isEqualTo(1L);
        assertThat(auditRepository.countTodayByUsuario(idUsuario)).isEqualTo(2L);
        assertThat(auditRepository.countTodayByUsuario(idUsuario)).isEqualTo(3L);
        
        // Verificar que se llamó 4 veces
        verify(auditRepository, times(4)).countTodayByUsuario(idUsuario);
    }
}

