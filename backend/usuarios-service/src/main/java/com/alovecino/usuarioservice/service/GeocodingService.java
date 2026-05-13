package com.alovecino.usuarioservice.service;

import java.math.BigDecimal;

import com.alovecino.usuarioservice.dto.DireccionRequest;

public interface GeocodingService {
    Coordinates geocode(DireccionRequest direccion);

    record Coordinates(BigDecimal latitud, BigDecimal longitud) {
    }
}
