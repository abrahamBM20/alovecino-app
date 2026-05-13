package com.alovecino.geolocationservice.service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.alovecino.geolocationservice.exception.GeocodingException;

@Service
public class GoogleGeocodingService implements GeocodingService {

    private static final String GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json";

    private final RestTemplate restTemplate;
    private final String apiKey;

    public GoogleGeocodingService(RestTemplate restTemplate, @Value("${google.maps.api.key}") String apiKey) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
    }

    @Override
    public Coordinates geocode(String address) {
        if (address == null || address.isBlank()) {
            throw new GeocodingException("La dirección de búsqueda no puede estar vacía.");
        }
        if (apiKey == null || apiKey.isBlank()) {
            throw new GeocodingException("Google Maps API key no está configurada.");
        }

        var encodedAddress = URLEncoder.encode(address, StandardCharsets.UTF_8);
        URI uri = URI.create(GEOCODING_URL + "?address=" + encodedAddress + "&key=" + apiKey);

        GoogleGeocodingResponse response;
        try {
            response = restTemplate.getForObject(uri, GoogleGeocodingResponse.class);
        } catch (RestClientException ex) {
            throw new GeocodingException("Error al conectar con la API de Google Maps.", ex);
        }

        if (response == null || response.status() == null) {
            throw new GeocodingException("Respuesta inválida de la API de Google Maps.");
        }

        if (!"OK".equalsIgnoreCase(response.status())) {
            if ("ZERO_RESULTS".equalsIgnoreCase(response.status())) {
                throw new GeocodingException("No se encontraron coordenadas para la dirección especificada.");
            }
            throw new GeocodingException("Google Maps API devolvió un estado inesperado: " + response.status());
        }

        if (response.results().isEmpty()) {
            throw new GeocodingException("No se encontraron resultados de geocodificación para la dirección proporcionada.");
        }

        var location = response.results().get(0).geometry().location();
        return new Coordinates(location.lat(), location.lng());
    }

    private record GoogleGeocodingResponse(String status, List<Result> results) {
    }

    private record Result(Geometry geometry) {
    }

    private record Geometry(Location location) {
    }

    private record Location(BigDecimal lat, BigDecimal lng) {
    }
}
