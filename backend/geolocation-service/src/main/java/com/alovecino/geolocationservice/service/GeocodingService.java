package com.alovecino.geolocationservice.service;

import java.math.BigDecimal;

public interface GeocodingService {

    Coordinates geocode(String address);

    record Coordinates(BigDecimal latitud, BigDecimal longitud) {
    }
}
