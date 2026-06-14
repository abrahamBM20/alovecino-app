package com.alovecino.geoservice.service;

public class GeocodeException extends RuntimeException {

    public GeocodeException(String message) {
        super(message);
    }

    public GeocodeException(String message, Throwable cause) {
        super(message, cause);
    }
}
