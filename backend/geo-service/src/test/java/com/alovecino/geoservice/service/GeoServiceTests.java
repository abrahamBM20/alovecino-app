package com.alovecino.geoservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.alovecino.geoservice.dto.GeocodeRequest;
import com.alovecino.geoservice.dto.GeocodeResponse;
import com.alovecino.geoservice.dto.StoreGeoResponse;
import com.alovecino.geoservice.model.Almacen;
import com.alovecino.geoservice.model.Comuna;
import com.alovecino.geoservice.model.Direccion;
import com.alovecino.geoservice.model.Region;
import com.alovecino.geoservice.repository.AlmacenGeoRepository;

class GeoServiceTests {

    private final AlmacenGeoRepository repository = mock(AlmacenGeoRepository.class);
    private final GeocodingClient geocodingClient = mock(GeocodingClient.class);
    private final GeoService geoService = new GeoService(repository, geocodingClient);

    @Test
    void shouldUseDefaultRadiusAndReturnOnlyStoresInsideRangeOrderedByDistance() {
        BigDecimal originLat = new BigDecimal("-33.4488900");
        BigDecimal originLng = new BigDecimal("-70.6692650");
        Almacen nearStore = store(1L, "Almacen cercano", "-33.4497900", "-70.6692650");
        Almacen farStore = store(2L, "Almacen lejano", "-33.4578900", "-70.6692650");

        when(repository.findCandidatesWithinBoundingBox(any(), any(), any(), any()))
                .thenReturn(List.of(farStore, nearStore));

        List<StoreGeoResponse> stores = geoService.findStores(originLat, originLng, null);

        assertThat(stores).extracting(StoreGeoResponse::getIdAlmacen).containsExactly(1L);
        assertThat(stores.getFirst().getDistanciaMetros()).isBetween(99L, 101L);
        assertThat(stores.getFirst().getDireccion()).isEqualTo("Calle 123, Santiago, Metropolitana");
        verify(repository).findCandidatesWithinBoundingBox(any(), any(), any(), any());
    }

    @Test
    void shouldRejectUnsupportedRadius() {
        assertThatThrownBy(() -> geoService.findStores(
                new BigDecimal("-33.4488900"),
                new BigDecimal("-70.6692650"),
                750))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("radio_metros");
    }

    @Test
    void shouldAcceptExtendedRadiusOptionsUsedByMobileFilters() {
        BigDecimal originLat = new BigDecimal("-33.4488900");
        BigDecimal originLng = new BigDecimal("-70.6692650");
        Almacen farStore = store(2L, "Almacen dentro de 10 km", "-33.4578900", "-70.6692650");

        when(repository.findCandidatesWithinBoundingBox(any(), any(), any(), any()))
                .thenReturn(List.of(farStore));

        List<StoreGeoResponse> stores = geoService.findStores(originLat, originLng, 10000);

        assertThat(stores).extracting(StoreGeoResponse::getIdAlmacen).containsExactly(2L);
    }

    @Test
    void shouldDelegateGeocoding() {
        GeocodeRequest request = geocodeRequest();
        GeocodeResponse expected = new GeocodeResponse(
                new BigDecimal("-33.4488900"),
                new BigDecimal("-70.6692650"),
                "Avenida Siempre Viva 742, Santiago, Chile",
                "google");
        when(geocodingClient.geocode(request)).thenReturn(expected);

        assertThat(geoService.geocode(request)).isSameAs(expected);
    }

    private static Almacen store(Long id, String name, String latitud, String longitud) {
        Region region = new Region();
        region.setNombre("Metropolitana");
        region.setCodigo("RM");

        Comuna comuna = new Comuna();
        comuna.setNombre("Santiago");
        comuna.setRegion(region);

        Direccion direccion = new Direccion();
        direccion.setCalle("Calle");
        direccion.setNumero("123");
        direccion.setLatitud(new BigDecimal(latitud));
        direccion.setLongitud(new BigDecimal(longitud));
        direccion.setComuna(comuna);

        Almacen almacen = new Almacen();
        almacen.setIdAlmacen(id);
        almacen.setNombre(name);
        almacen.setDireccion(direccion);
        return almacen;
    }

    private static GeocodeRequest geocodeRequest() {
        GeocodeRequest request = new GeocodeRequest();
        request.setCalle("Avenida Siempre Viva");
        request.setNumero("742");
        request.setComuna("Santiago");
        request.setRegion("Metropolitana");
        return request;
    }
}
