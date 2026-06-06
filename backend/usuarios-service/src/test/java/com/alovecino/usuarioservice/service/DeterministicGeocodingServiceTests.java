package com.alovecino.usuarioservice.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.context.SecurityContextHolder;

import com.alovecino.usuarioservice.dto.DireccionRequest;
import com.sun.net.httpserver.HttpServer;

class DeterministicGeocodingServiceTests {

    private HttpServer server;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void usesInternalGeocodeEndpointWhenNoJwtIsAvailable() throws IOException {
        AtomicReference<String> path = new AtomicReference<>();
        AtomicReference<String> apiKey = new AtomicReference<>();
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/api/geo/internal/geocode", exchange -> {
            path.set(exchange.getRequestURI().getPath());
            apiKey.set(exchange.getRequestHeaders().getFirst("X-Internal-Api-Key"));
            byte[] body = """
                    {"latitud":-33.4876000,"longitud":-70.5389000}
                    """.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, body.length);
            try (OutputStream output = exchange.getResponseBody()) {
                output.write(body);
            }
        });
        server.start();

        String baseUrl = "http://localhost:" + server.getAddress().getPort();
        DeterministicGeocodingService service = new DeterministicGeocodingService(baseUrl, 500, "dev-secret");

        GeocodingService.Coordinates coordinates = service.geocode(direccion());

        assertThat(path.get()).isEqualTo("/api/geo/internal/geocode");
        assertThat(apiKey.get()).isEqualTo("dev-secret");
        assertThat(coordinates.latitud()).isEqualByComparingTo(new BigDecimal("-33.4876000"));
        assertThat(coordinates.longitud()).isEqualByComparingTo(new BigDecimal("-70.5389000"));
    }

    private DireccionRequest direccion() {
        DireccionRequest direccion = new DireccionRequest();
        direccion.setCalle("Pasaje Los Queltehues");
        direccion.setNumero("1234");
        direccion.setComuna("Penalolen");
        direccion.setRegion("Metropolitana de Santiago");
        direccion.setCodigoPostal("7910000");
        return direccion;
    }
}
