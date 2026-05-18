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
import com.alovecino.geolocationservice.model.GeocodeAudit;
import com.alovecino.geolocationservice.repository.GeocodeAuditRepository;

@Service
public class GoogleGeocodingService implements GeocodingService {

    private static final String GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json";

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final GeocodeAuditRepository auditRepository;
    private final long dailyLimit;

    public GoogleGeocodingService(RestTemplate restTemplate, 
            @Value("${google.maps.api.key}") String apiKey,
            GeocodeAuditRepository auditRepository,
            @Value("${geocoding.daily-limit:100}") long dailyLimit) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
        this.auditRepository = auditRepository;
        this.dailyLimit = dailyLimit;
    }

    @Override
    public Coordinates geocode(String address) {
        // Llama el método interno que maneja auditoría con idUsuario = null
        return geocodeWithAudit(address, null);
    }

    /**
     * Geocodifica una dirección con auditoría de límite diario.
     * 
     * @param address La dirección a geocodificar
     * @param idUsuario El ID del usuario (puede ser null si no hay límite a aplicar)
     * @return Coordenadas geocodificadas
     * @throws GeocodingException si el límite diario es alcanzado
     */
    public Coordinates geocodeWithAudit(String address, Long idUsuario) {
        // Validar límite diario si se proporciona idUsuario
        if (idUsuario != null) {
            long callsToday = auditRepository.countTodayByUsuario(idUsuario);
            if (callsToday >= dailyLimit) {
                auditRepository.save(new GeocodeAudit(idUsuario, address, "LIMIT_EXCEEDED"));
                throw new GeocodingException(
                    String.format("Límite diario de %d llamadas a geocodificación alcanzado", dailyLimit)
                );
            }
        }

        // Llamar a Google API
        Coordinates coordinates = callGoogleGeocodeAPI(address);
        
        // Registrar auditoría si se proporciona idUsuario
        if (idUsuario != null) {
            auditRepository.save(new GeocodeAudit(idUsuario, address, "SUCCESS"));
        }
        
        return coordinates;
    }

    private Coordinates callGoogleGeocodeAPI(String address) {
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
