package com.alovecino.geoservice.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

import com.alovecino.geoservice.dto.GeocodeRequest;

class GoogleGeocodingClientTests {

    @Test
    void shouldFailWithControlledErrorWhenApiKeyIsMissingAndCacheIsEmpty() {
        GoogleGeocodingClient client = new GoogleGeocodingClient("", "https://maps.googleapis.com/maps/api/geocode/json",
                250, 100);

        assertThatThrownBy(() -> client.geocode(geocodeRequest()))
                .isInstanceOf(GeocodeException.class)
                .hasMessageContaining("Google Maps API key");
    }

    @Test
    void shouldFailWithControlledErrorWhenDailyLimitIsReached() {
        GoogleGeocodingClient client = new GoogleGeocodingClient("fake-key",
                "https://maps.googleapis.com/maps/api/geocode/json", 250, 0);

        assertThatThrownBy(() -> client.geocode(geocodeRequest()))
                .isInstanceOf(GeocodeException.class)
                .hasMessageContaining("límite diario");
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
