package com.alovecino.geoservice.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

class GeoDistanceTests {

    @Test
    void shouldCalculateApproximateDistanceInMeters() {
        double distance = GeoDistance.meters(
                new BigDecimal("-33.4488900"),
                new BigDecimal("-70.6692650"),
                new BigDecimal("-33.4497900"),
                new BigDecimal("-70.6692650"));

        assertThat(distance).isBetween(99.0, 101.0);
    }
}
