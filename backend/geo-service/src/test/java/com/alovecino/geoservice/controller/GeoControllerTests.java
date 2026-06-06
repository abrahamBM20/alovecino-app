package com.alovecino.geoservice.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.alovecino.geoservice.dto.GeocodeRequest;
import com.alovecino.geoservice.dto.GeocodeResponse;
import com.alovecino.geoservice.service.GeoService;

class GeoControllerTests {

    @Test
    void internalGeocodeRequiresConfiguredApiKey() {
        GeoService geoService = mock(GeoService.class);
        GeoController controller = new GeoController(geoService, "dev-secret");
        GeocodeRequest request = request();
        GeocodeResponse expected = new GeocodeResponse(new BigDecimal("-33.4876000"),
                new BigDecimal("-70.5389000"), "Pasaje Los Queltehues 1234", "google");

        when(geoService.geocode(request)).thenReturn(expected);

        GeocodeResponse response = controller.internalGeocode("dev-secret", request);

        assertThat(response).isSameAs(expected);
        verify(geoService).geocode(request);
    }

    @Test
    void internalGeocodeRejectsMissingOrInvalidApiKey() {
        GeoService geoService = mock(GeoService.class);
        GeoController controller = new GeoController(geoService, "dev-secret");
        GeocodeRequest request = request();

        assertThatThrownBy(() -> controller.internalGeocode("otro-secret", request))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(HttpStatus.UNAUTHORIZED));

        assertThatThrownBy(() -> controller.internalGeocode(null, request))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(HttpStatus.UNAUTHORIZED));
        verifyNoInteractions(geoService);
    }

    private GeocodeRequest request() {
        GeocodeRequest request = new GeocodeRequest();
        request.setCalle("Pasaje Los Queltehues");
        request.setNumero("1234");
        request.setComuna("Penalolen");
        request.setRegion("Metropolitana de Santiago");
        return request;
    }
}
