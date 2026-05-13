package com.alovecino.geolocationservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.alovecino.geolocationservice.dto.CoordinatesResponse;
import com.alovecino.geolocationservice.dto.DireccionRequest;
import com.alovecino.geolocationservice.service.GeolocationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/geolocalizacion")
@Tag(name = "Geolocalización", description = "Servicios de geolocalización y geocodificación")
public class GeolocationController {

    private final GeolocationService geolocationService;

    public GeolocationController(GeolocationService geolocationService) {
        this.geolocationService = geolocationService;
    }

    @Operation(summary = "Geocodificar una dirección")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Coordenadas calculadas", content = @Content(schema = @Schema(implementation = CoordinatesResponse.class))),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida", content = @Content)
    })
    @PostMapping("/geocode")
    public ResponseEntity<CoordinatesResponse> geocode(@Valid @RequestBody DireccionRequest request) {
        var coordinates = geolocationService.geocode(request);
        CoordinatesResponse response = new CoordinatesResponse(coordinates.latitud(), coordinates.longitud());
        return ResponseEntity.ok(response);
    }
}
