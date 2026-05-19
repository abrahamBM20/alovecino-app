package com.alovecino.geoservice.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.alovecino.geoservice.dto.GeocodeRequest;
import com.alovecino.geoservice.dto.GeocodeResponse;

@Service
public class GoogleGeocodingClient implements GeocodingClient {

    private final String apiKey;
    private final RestClient restClient;
    private final Map<String, GeocodeResponse> cache = new ConcurrentHashMap<>();
    private final int dailyRequestLimit;
    private final Clock clock;
    private final AtomicInteger dailyRequests = new AtomicInteger();
    private volatile LocalDate currentRequestDate;

    @Autowired
    public GoogleGeocodingClient(
            @Value("${geo.google.api-key:}") String apiKey,
            @Value("${geo.google.geocode-url:https://maps.googleapis.com/maps/api/geocode/json}") String geocodeUrl,
            @Value("${geo.google.timeout-ms:2500}") long timeoutMs,
            @Value("${geo.google.daily-request-limit:100}") int dailyRequestLimit) {
        this(apiKey, geocodeUrl, timeoutMs, dailyRequestLimit, Clock.systemDefaultZone());
    }

    GoogleGeocodingClient(String apiKey, String geocodeUrl, long timeoutMs, int dailyRequestLimit, Clock clock) {
        this.apiKey = apiKey;
        this.dailyRequestLimit = dailyRequestLimit;
        this.clock = clock;
        this.currentRequestDate = LocalDate.now(clock);
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory();
        requestFactory.setReadTimeout(Duration.ofMillis(timeoutMs));
        this.restClient = RestClient.builder()
                .baseUrl(geocodeUrl)
                .requestFactory(requestFactory)
                .build();
    }

    @Override
    public GeocodeResponse geocode(GeocodeRequest request) {
        String address = request.toAddressLine();
        if (apiKey == null || apiKey.isBlank()) {
            return cachedOrFail(address, "Google Maps API key is not configured");
        }
        if (!reserveDailyRequest()) {
            return cachedOrFail(address, "Se alcanzó el límite diario configurado para Google Maps");
        }

        try {
            GoogleGeocodeResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .queryParam("address", address)
                            .queryParam("key", apiKey)
                            .build())
                    .retrieve()
                    .body(GoogleGeocodeResponse.class);

            GeocodeResponse geocode = parse(address, response);
            cache.put(address, geocode);
            return geocode;
        } catch (RestClientException | IllegalStateException ex) {
            return cachedOrFail(address, "No se pudo geocodificar la dirección", ex);
        }
    }

    private boolean reserveDailyRequest() {
        if (dailyRequestLimit <= 0) {
            return false;
        }

        LocalDate today = LocalDate.now(clock);
        if (!today.equals(currentRequestDate)) {
            synchronized (this) {
                if (!today.equals(currentRequestDate)) {
                    dailyRequests.set(0);
                    currentRequestDate = today;
                }
            }
        }

        return dailyRequests.incrementAndGet() <= dailyRequestLimit;
    }

    private GeocodeResponse parse(String address, GoogleGeocodeResponse response) {
        if (response == null || response.results() == null || response.results().isEmpty()) {
            return cachedOrFail(address, "Google Maps no retornó resultados para la dirección");
        }
        if (!"OK".equalsIgnoreCase(response.status())) {
            return cachedOrFail(address, "Google Maps rechazó la geocodificación: " + response.status());
        }

        GoogleResult result = response.results().getFirst();
        GoogleLocation location = result.geometry().location();
        return new GeocodeResponse(
                BigDecimal.valueOf(location.lat()).setScale(7, RoundingMode.HALF_UP),
                BigDecimal.valueOf(location.lng()).setScale(7, RoundingMode.HALF_UP),
                result.formattedAddress(),
                "google");
    }

    private GeocodeResponse cachedOrFail(String address, String message) {
        return cachedOrFail(address, message, null);
    }

    private GeocodeResponse cachedOrFail(String address, String message, Throwable cause) {
        GeocodeResponse cached = cache.get(address);
        if (cached != null) {
            return new GeocodeResponse(cached.getLatitud(), cached.getLongitud(),
                    cached.getDireccionFormateada(), "cache");
        }
        if (cause == null) {
            throw new GeocodeException(message);
        }
        throw new GeocodeException(message, cause);
    }

    record GoogleGeocodeResponse(String status, List<GoogleResult> results) {
    }

    record GoogleResult(
            @com.fasterxml.jackson.annotation.JsonProperty("formatted_address") String formattedAddress,
            GoogleGeometry geometry) {
    }

    record GoogleGeometry(GoogleLocation location) {
    }

    record GoogleLocation(double lat, double lng) {
    }
}
