package com.alovecino.consultaservice.dto;

import lombok.Data;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

@Data
public class ConsultaRequest {

    @NotNull(message = "El ID del cliente es obligatorio")
    @Positive(message = "El ID del cliente debe ser mayor a 0")
    private Long idCliente;

    @NotNull(message = "El ID del almacén es obligatorio")
    @Positive(message = "El ID del almacén debe ser mayor a 0")
    private Long idAlmacen;

    @Valid
    @NotEmpty(message = "Debe informar al menos un detalle de consulta")
    @Size(max = 20, message = "Una consulta no puede contener más de 20 detalles")
    private List<ConsultaDetalleRequest> detalles;
}
