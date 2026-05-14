package com.alovecino.consultaservice.dto;

import lombok.Data;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

@Data
public class ConsultaRequest {

    @NotBlank(message = "La descripción es obligatoria")
    @Size(max = 1000, message = "La descripción no puede exceder 1000 caracteres")
    private String descripcion;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    private Integer cantidad;

    @NotNull(message = "El ID del cliente es obligatorio")
    @Positive(message = "El ID del cliente debe ser mayor a 0")
    private Long idCliente;

    @NotNull(message = "El ID del almacén es obligatorio")
    @Positive(message = "El ID del almacén debe ser mayor a 0")
    private Long idAlmacen;

    /**
     * Campo mantenido solo por compatibilidad con clientes antiguos.
     * La respuesta se registra únicamente desde el endpoint /responder.
     */
    @Deprecated
    private String respuesta;

    /**
     * Campo mantenido solo por compatibilidad con clientes antiguos.
     * Al crear una consulta, el backend asigna automáticamente el estado PENDIENTE.
     */
    @Deprecated
    private Long idEstadoConsulta;
}
