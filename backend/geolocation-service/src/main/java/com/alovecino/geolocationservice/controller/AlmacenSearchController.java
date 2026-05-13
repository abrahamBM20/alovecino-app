package com.alovecino.geolocationservice.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.alovecino.geolocationservice.dto.AlmacenNearbyResponse;
import com.alovecino.geolocationservice.repository.AlmacenRepository;
import com.alovecino.geolocationservice.service.GeocodingService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api/v1/almacenes")
@Validated
@Tag(name = "Almacenes", description = "Búsqueda espacial de almacenes registrados")
public class AlmacenSearchController {

    private final GeocodingService geocodingService;
    private final AlmacenRepository almacenRepository;

    public AlmacenSearchController(GeocodingService geocodingService, AlmacenRepository almacenRepository) {
        this.geocodingService = geocodingService;
        this.almacenRepository = almacenRepository;
    }

    @Operation(summary = "Buscar almacenes cercanos por ubicación o dirección")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de almacenes cercanos"),
            @ApiResponse(responseCode = "400", description = "Parámetros de búsqueda inválidos")
    })
    @GetMapping("/busqueda-espacial")
    public ResponseEntity<List<AlmacenNearbyResponse>> buscarAlmacenesCercanos(
            @RequestParam(required = false) String direccion,
            @RequestParam(required = false) BigDecimal lat,
            @RequestParam(required = false) BigDecimal lng,
            @RequestParam(defaultValue = "5.0") @Positive double radioKm) {

        if ((lat == null || lng == null) && (direccion == null || direccion.isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Se requiere latitud/longitud o una dirección para realizar la búsqueda.");
        }

        BigDecimal actualLat = lat;
        BigDecimal actualLng = lng;
        if (actualLat == null || actualLng == null) {
            var coordinates = geocodingService.geocode(direccion);
            actualLat = coordinates.latitud();
            actualLng = coordinates.longitud();
        }

        var nearbyProjections = almacenRepository.findNearby(actualLat, actualLng, radioKm);
        var responses = nearbyProjections.stream().map(AlmacenNearbyResponse::fromProjection).toList();
        return ResponseEntity.ok(responses);
    }
}
