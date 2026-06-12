package com.alovecino.usuarioservice.controller;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

class ApiExceptionHandlerTests {

    private final ApiExceptionHandler handler = new ApiExceptionHandler();

    @Test
    void shouldExposeResponseStatusExceptionReasonAsMessage() {
        ResponseStatusException exception = new ResponseStatusException(
                HttpStatus.BAD_GATEWAY,
                "No se pudo geocodificar la dirección. Intenta nuevamente.");

        ResponseEntity<Map<String, String>> response = handler.handleResponseStatus(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_GATEWAY);
        assertThat(response.getBody()).containsEntry("message",
                "No se pudo geocodificar la dirección. Intenta nuevamente.");
    }
}
