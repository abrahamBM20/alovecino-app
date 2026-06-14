package com.alovecino.geoservice.controller;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.alovecino.geoservice.dto.GeocodeRequest;
import com.alovecino.geoservice.dto.GeocodeResponse;
import com.alovecino.geoservice.dto.StoreGeoResponse;
import com.alovecino.geoservice.service.GeoService;

@Validated
@RestController
@RequestMapping("/api/geo")
public class GeoController {

    public static final String INTERNAL_API_KEY_HEADER = "X-Internal-Api-Key";

    private final GeoService geoService;
    private final String internalApiKey;

    public GeoController(GeoService geoService,
            @Value("${geo.internal.api-key:${GEO_INTERNAL_API_KEY:}}") String internalApiKey) {
        this.geoService = geoService;
        this.internalApiKey = internalApiKey;
    }

    @GetMapping("/stores")
    public List<StoreGeoResponse> findStores(
            @RequestParam @DecimalMin("-90.0") @DecimalMax("90.0") BigDecimal latitud,
            @RequestParam @DecimalMin("-180.0") @DecimalMax("180.0") BigDecimal longitud,
            @RequestParam(name = "radio_metros", required = false) Integer radioMetros) {
        return geoService.findStores(latitud, longitud, radioMetros);
    }

    @PostMapping("/geocode")
    public GeocodeResponse geocode(@Valid @RequestBody GeocodeRequest request) {
        return geoService.geocode(request);
    }

    @PostMapping("/internal/geocode")
    public GeocodeResponse internalGeocode(
            @RequestHeader(value = INTERNAL_API_KEY_HEADER, required = false) String apiKey,
            @Valid @RequestBody GeocodeRequest request) {
        if (!StringUtils.hasText(internalApiKey) || !internalApiKey.equals(apiKey)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credencial interna invalida");
        }
        return geoService.geocode(request);
    }
}
