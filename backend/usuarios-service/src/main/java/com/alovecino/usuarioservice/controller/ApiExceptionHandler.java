package com.alovecino.usuarioservice.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.alovecino.usuarioservice.exception.UsuarioNotFoundException;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleBadRequest(IllegalArgumentException ex) {
        return Map.of("message", ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public Map<String, String> handleAccessDenied(AccessDeniedException ex) {
        return Map.of("message", ex.getMessage());
    }

    @ExceptionHandler(UsuarioNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> handleNotFound(UsuarioNotFoundException ex) {
        return Map.of("message", ex.getMessage());
    }
}
