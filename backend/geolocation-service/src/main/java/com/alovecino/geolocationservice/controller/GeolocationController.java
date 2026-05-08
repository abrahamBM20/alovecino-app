package com.alovecino.geolocationservice.controller;

import java.math.BigDecimal;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.alovecino.geolocationservice.client.UsuariosServiceAddressResponse;
import com.alovecino.geolocationservice.client.UsuariosServiceClient;
import com.alovecino.geolocationservice.dto.CoordinatesResponse;
import com.alovecino.geolocationservice.dto.DireccionRequest;
import com.alovecino.geolocationservice.service.GeolocationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/geolocalizacion")
@Tag(name = "Geolocalización", description = "Servicios de geolocalización y geocodificación")
public class GeolocationController {

    private final GeolocationService geolocationService;
    private final UsuariosServiceClient usuariosServiceClient;

    public GeolocationController(GeolocationService geolocationService,
            UsuariosServiceClient usuariosServiceClient) {
        this.geolocationService = geolocationService;
        this.usuariosServiceClient = usuariosServiceClient;
    }

    @Operation(summary = "Geocodificar una dirección")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Coordenadas calculadas", content = @Content(schema = @Schema(implementation = CoordinatesResponse.class))),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida", content = @Content)
    })
    @PostMapping("/geocode")
    public ResponseEntity<CoordinatesResponse> geocode(@Valid @RequestBody DireccionRequest request) {
        var coordinates = geolocationService.geocode(request);
        return ResponseEntity.ok(new CoordinatesResponse(coordinates.latitud(), coordinates.longitud()));
    }

    @Operation(summary = "Obtener coordenadas de un almacén existente")
    @GetMapping("/almacenes/{id}")
    public ResponseEntity<CoordinatesResponse> geocodeAlmacen(@PathVariable("id") Long idAlmacen) {
        UsuariosServiceAddressResponse address = usuariosServiceClient.getAlmacenAddress(idAlmacen);
        var coordinates = resolveCoordinates(address);
        return ResponseEntity.ok(new CoordinatesResponse(coordinates.latitud(), coordinates.longitud()));
    }

    @Operation(summary = "Obtener coordenadas de un cliente existente")
    @GetMapping("/clientes/{id}")
    public ResponseEntity<CoordinatesResponse> geocodeCliente(@PathVariable("id") Long idCliente) {
        UsuariosServiceAddressResponse address = usuariosServiceClient.getClienteAddress(idCliente);
        var coordinates = resolveCoordinates(address);
        return ResponseEntity.ok(new CoordinatesResponse(coordinates.latitud(), coordinates.longitud()));
    }

    private GeolocationService.Coordinates resolveCoordinates(UsuariosServiceAddressResponse address) {
        if (address.getLatitud() != null && address.getLongitud() != null) {
            return new GeolocationService.Coordinates(new BigDecimal(address.getLatitud()),
                    new BigDecimal(address.getLongitud()));
        }

        DireccionRequest request = new DireccionRequest();
        request.setCalle(address.getCalle());
        request.setNumero(address.getNumero());
        request.setComuna(address.getComuna());
        request.setRegion(address.getRegion());
        request.setCodigoPostal(address.getCodigoPostal());
        return geolocationService.geocode(request);
    }
}
