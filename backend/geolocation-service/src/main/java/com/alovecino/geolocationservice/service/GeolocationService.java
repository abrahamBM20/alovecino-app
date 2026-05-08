package com.alovecino.geolocationservice.service;

import java.math.BigDecimal;

import com.alovecino.geolocationservice.dto.DireccionRequest;

public interface GeolocationService {

    Coordinates geocode(DireccionRequest direccion);

    record Coordinates(BigDecimal latitud, BigDecimal longitud) {
    }
}
