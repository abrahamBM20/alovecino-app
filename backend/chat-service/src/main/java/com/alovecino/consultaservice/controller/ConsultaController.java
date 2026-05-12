package com.alovecino.consultaservice.controller;

import com.alovecino.consultaservice.dto.ConsultaRequest;
import com.alovecino.consultaservice.dto.ConsultaResponse;
import com.alovecino.consultaservice.service.ConsultaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consultas")
@RequiredArgsConstructor
@Tag(name = "Consultas", description = "API para gestión de consultas entre clientes y almacenes")
public class ConsultaController {

    private final ConsultaService consultaService;

    @PostMapping
    @Operation(summary = "Crear una nueva consulta")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<ConsultaResponse> crearConsulta(@Valid @RequestBody ConsultaRequest request) {
        ConsultaResponse response = consultaService.crearConsulta(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener consulta por ID")
    @PreAuthorize("hasRole('CLIENTE') or hasRole('ALMACEN')")
    public ResponseEntity<ConsultaResponse> obtenerConsulta(@PathVariable Long id) {
        ConsultaResponse response = consultaService.obtenerConsulta(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/cliente/{idCliente}")
    @Operation(summary = "Obtener consultas por cliente")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<List<ConsultaResponse>> obtenerConsultasPorCliente(@PathVariable Long idCliente) {
        List<ConsultaResponse> response = consultaService.obtenerConsultasPorCliente(idCliente);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/almacen/{idAlmacen}")
    @Operation(summary = "Obtener consultas por almacén")
    @PreAuthorize("hasRole('ALMACEN')")
    public ResponseEntity<List<ConsultaResponse>> obtenerConsultasPorAlmacen(@PathVariable Long idAlmacen) {
        List<ConsultaResponse> response = consultaService.obtenerConsultasPorAlmacen(idAlmacen);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/responder")
    @Operation(summary = "Responder a una consulta")
    @PreAuthorize("hasRole('ALMACEN')")
    public ResponseEntity<ConsultaResponse> responderConsulta(
            @PathVariable Long id,
            @RequestParam String respuesta,
            @RequestParam Long idEstadoConsulta) {
        ConsultaResponse response = consultaService.responderConsulta(id, respuesta, idEstadoConsulta);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/estado")
    @Operation(summary = "Actualizar estado de consulta")
    @PreAuthorize("hasRole('CLIENTE') or hasRole('ALMACEN')")
    public ResponseEntity<ConsultaResponse> actualizarEstadoConsulta(
            @PathVariable Long id,
            @RequestParam Long idEstadoConsulta) {
        ConsultaResponse response = consultaService.actualizarEstadoConsulta(id, idEstadoConsulta);
        return ResponseEntity.ok(response);
    }
}
