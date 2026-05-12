package main.java.com.alovecino.consultaservice.controller;

import main.java.com.alovecino.consultaservice.dto.EstadoConsultaRequest;
import main.java.com.alovecino.consultaservice.dto.EstadoConsultaResponse;
import main.java.com.alovecino.consultaservice.service.EstadoConsultaService;
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
@RequestMapping("/api/estados-consulta")
@RequiredArgsConstructor
@Tag(name = "Estados de Consulta", description = "API para gestión de estados de consulta")
public class EstadoConsultaController {

    private final EstadoConsultaService estadoConsultaService;

    @PostMapping
    @Operation(summary = "Crear un nuevo estado de consulta")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EstadoConsultaResponse> crearEstadoConsulta(@Valid @RequestBody EstadoConsultaRequest request) {
        EstadoConsultaResponse response = estadoConsultaService.crearEstadoConsulta(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Obtener todos los estados de consulta")
    public ResponseEntity<List<EstadoConsultaResponse>> obtenerEstadosConsulta() {
        List<EstadoConsultaResponse> response = estadoConsultaService.obtenerEstadosConsulta();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener estado de consulta por ID")
    public ResponseEntity<EstadoConsultaResponse> obtenerEstadoConsulta(@PathVariable Long id) {
        EstadoConsultaResponse response = estadoConsultaService.obtenerEstadoConsulta(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar estado de consulta")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EstadoConsultaResponse> actualizarEstadoConsulta(
            @PathVariable Long id,
            @Valid @RequestBody EstadoConsultaRequest request) {
        EstadoConsultaResponse response = estadoConsultaService.actualizarEstadoConsulta(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar estado de consulta")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminarEstadoConsulta(@PathVariable Long id) {
        estadoConsultaService.eliminarEstadoConsulta(id);
        return ResponseEntity.noContent().build();
    }
}