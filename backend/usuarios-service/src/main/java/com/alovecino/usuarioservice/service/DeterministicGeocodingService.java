package com.alovecino.usuarioservice.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.alovecino.usuarioservice.dto.DireccionRequest;

@Service
public class DeterministicGeocodingService implements GeocodingService {

    private static final String INTERNAL_API_KEY_HEADER = "X-Internal-Api-Key";

    private final RestClient geoClient;
    private final String internalApiKey;

    public DeterministicGeocodingService(
            @Value("${usuarios.geo-service.base-url:http://localhost:8083}") String geoServiceUrl,
            @Value("${usuarios.geo-service.timeout-ms:2500}") long timeoutMs,
            @Value("${usuarios.geo-service.internal-api-key:${GEO_INTERNAL_API_KEY:}}") String internalApiKey) {
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory();
        requestFactory.setReadTimeout(Duration.ofMillis(timeoutMs));
        this.geoClient = RestClient.builder()
                .baseUrl(geoServiceUrl)
                .requestFactory(requestFactory)
                .build();
        this.internalApiKey = internalApiKey;
    }

    @Override
    public Coordinates geocode(DireccionRequest direccion) {
        String token = currentAccessToken();
        if (StringUtils.hasText(token)) {
            Coordinates coordinates = geocodeWithToken(direccion, token);
            if (coordinates != null) {
                return coordinates;
            }
        }

        if (StringUtils.hasText(internalApiKey)) {
            Coordinates coordinates = geocodeWithInternalKey(direccion);
            if (coordinates != null) {
                return coordinates;
            }
        }

        return deterministicCoordinates(direccion);
    }

    private Coordinates geocodeWithToken(DireccionRequest direccion, String token) {
        return geocodeRemote(direccion, geoClient.post()
                .uri("/api/geo/geocode")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token));
    }

    private Coordinates geocodeWithInternalKey(DireccionRequest direccion) {
        return geocodeRemote(direccion, geoClient.post()
                .uri("/api/geo/internal/geocode")
                .header(INTERNAL_API_KEY_HEADER, internalApiKey));
    }

    private Coordinates geocodeRemote(DireccionRequest direccion, RestClient.RequestBodySpec request) {
        try {
            GeoResponse response = request
                    .body(new GeoRequest(direccion.getCalle(), direccion.getNumero(), direccion.getComuna(),
                            direccion.getRegion()))
                    .retrieve()
                    .body(GeoResponse.class);

            if (response != null && response.latitud() != null && response.longitud() != null) {
                return new Coordinates(response.latitud(), response.longitud());
            }
        } catch (RestClientException | IllegalStateException ex) {
            return null;
        }
        return null;
    }

    private Coordinates deterministicCoordinates(DireccionRequest direccion) {
        String value = String.join("|", direccion.getCalle(), direccion.getNumero(), direccion.getComuna(),
                direccion.getRegion());
        int hash = Math.abs(value.toLowerCase().hashCode());
        BigDecimal latitud = BigDecimal.valueOf(-33.65 + (hash % 7000) / 10000.0).setScale(7, RoundingMode.HALF_UP);
        BigDecimal longitud = BigDecimal.valueOf(-70.95 + ((hash / 7000) % 7000) / 10000.0)
                .setScale(7, RoundingMode.HALF_UP);
        return new Coordinates(latitud, longitud);
    }

    private String currentAccessToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken jwtAuthentication) {
            return jwtAuthentication.getToken().getTokenValue();
        }
        return null;
    }

    record GeoRequest(String calle, String numero, String comuna, String region) {
    }

    record GeoResponse(BigDecimal latitud, BigDecimal longitud) {
    }
}
