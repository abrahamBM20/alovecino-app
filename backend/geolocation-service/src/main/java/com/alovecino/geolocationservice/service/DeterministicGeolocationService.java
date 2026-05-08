package com.alovecino.geolocationservice.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.stereotype.Service;

import com.alovecino.geolocationservice.dto.DireccionRequest;

@Service
public class DeterministicGeolocationService implements GeolocationService {

    @Override
    public Coordinates geocode(DireccionRequest direccion) {
        String value = String.join("|", direccion.getCalle(), direccion.getNumero(), direccion.getComuna(),
                direccion.getRegion(), direccion.getCodigoPostal() == null ? "" : direccion.getCodigoPostal());
        int hash = Math.abs(value.toLowerCase().hashCode());
        BigDecimal latitud = BigDecimal.valueOf(-33.65 + (hash % 7000) / 10000.0).setScale(7, RoundingMode.HALF_UP);
        BigDecimal longitud = BigDecimal.valueOf(-70.95 + ((hash / 7000) % 7000) / 10000.0)
                .setScale(7, RoundingMode.HALF_UP);
        return new Coordinates(latitud, longitud);
    }
}
