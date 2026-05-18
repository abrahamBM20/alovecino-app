package com.alovecino.geolocationservice.controller;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.alovecino.geolocationservice.dto.AlmacenResponse;
import com.alovecino.geolocationservice.dto.CrearAlmacenRequest;
import com.alovecino.geolocationservice.service.AlmacenService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/geolocalizacion")
@Tag(name = "Geolocalización", description = "Servicios de geolocalización y persistencia de almacenes")
public class AlmacenPersistenceController {

    private final AlmacenService almacenService;

    public AlmacenPersistenceController(AlmacenService almacenService) {
        this.almacenService = almacenService;
    }

    @Operation(summary = "Crear o reutilizar un almacén con dirección")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Almacén creado o encontrado", content = @Content(schema = @Schema(implementation = AlmacenResponse.class)) ),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content)
    })
    @PostMapping("/almacen")
    public ResponseEntity<AlmacenResponse> crearAlmacen(@Valid @RequestBody CrearAlmacenRequest request) {
        AlmacenResponse response = almacenService.crearAlmacen(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
