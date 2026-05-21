package com.alovecino.geoservice.controller;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alovecino.geoservice.dto.GeocodeRequest;
import com.alovecino.geoservice.dto.GeocodeResponse;
import com.alovecino.geoservice.dto.StoreGeoResponse;
import com.alovecino.geoservice.service.GeoService;

@Validated
@RestController
@RequestMapping("/api/geo")
public class GeoController {

    private final GeoService geoService;

    public GeoController(GeoService geoService) {
        this.geoService = geoService;
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
}
