package com.alovecino.geoservice.service;

import java.math.BigDecimal;

public final class GeoDistance {

    private static final double EARTH_RADIUS_METERS = 6_371_000;

    private GeoDistance() {
    }

    public static double meters(BigDecimal originLatitud, BigDecimal originLongitud,
            BigDecimal targetLatitud, BigDecimal targetLongitud) {
        double lat1 = Math.toRadians(originLatitud.doubleValue());
        double lat2 = Math.toRadians(targetLatitud.doubleValue());
        double deltaLat = lat2 - lat1;
        double deltaLng = Math.toRadians(targetLongitud.doubleValue() - originLongitud.doubleValue());

        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
                + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_METERS * c;
    }
}
