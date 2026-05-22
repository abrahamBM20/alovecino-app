package com.alovecino.geoservice.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alovecino.geoservice.dto.GeocodeRequest;
import com.alovecino.geoservice.dto.GeocodeResponse;
import com.alovecino.geoservice.dto.StoreGeoResponse;
import com.alovecino.geoservice.model.Almacen;
import com.alovecino.geoservice.model.Direccion;
import com.alovecino.geoservice.repository.AlmacenGeoRepository;

@Service
public class GeoService {

    public static final int DEFAULT_RADIUS_METERS = 500;
    private static final Set<Integer> ALLOWED_RADIUS_METERS = Set.of(200, 500, 1000, 2000);
    private static final BigDecimal METERS_PER_LATITUDE_DEGREE = new BigDecimal("111320");

    private final AlmacenGeoRepository almacenGeoRepository;
    private final GeocodingClient geocodingClient;

    public GeoService(AlmacenGeoRepository almacenGeoRepository, GeocodingClient geocodingClient) {
        this.almacenGeoRepository = almacenGeoRepository;
        this.geocodingClient = geocodingClient;
    }

    @Transactional(readOnly = true)
    public List<StoreGeoResponse> findStores(BigDecimal latitud, BigDecimal longitud, Integer radiusMeters) {
        int radius = normalizeRadius(radiusMeters);
        BoundingBox box = boundingBox(latitud, longitud, radius);

        return almacenGeoRepository.findCandidatesWithinBoundingBox(
                box.minLatitud(), box.maxLatitud(), box.minLongitud(), box.maxLongitud()).stream()
                .map(almacen -> toStoreResponse(almacen, latitud, longitud))
                .filter(store -> store.getDistanciaMetros() <= radius)
                .sorted(Comparator.comparingLong(StoreGeoResponse::getDistanciaMetros))
                .toList();
    }

    public GeocodeResponse geocode(GeocodeRequest request) {
        return geocodingClient.geocode(request);
    }

    private int normalizeRadius(Integer radiusMeters) {
        int radius = radiusMeters == null ? DEFAULT_RADIUS_METERS : radiusMeters;
        if (!ALLOWED_RADIUS_METERS.contains(radius)) {
            throw new IllegalArgumentException("radio_metros debe ser uno de: 200, 500, 1000, 2000");
        }
        return radius;
    }

    private StoreGeoResponse toStoreResponse(Almacen almacen, BigDecimal originLatitud, BigDecimal originLongitud) {
        Direccion direccion = almacen.getDireccion();
        double distance = GeoDistance.meters(originLatitud, originLongitud, direccion.getLatitud(),
                direccion.getLongitud());
        long distanceMeters = Math.round(distance);
        BigDecimal distanceKm = BigDecimal.valueOf(distance / 1000).setScale(3, RoundingMode.HALF_UP);
        return new StoreGeoResponse(
                almacen.getIdAlmacen(),
                almacen.getNombre(),
                direccion.getLatitud(),
                direccion.getLongitud(),
                distanceMeters,
                distanceKm,
                direccion.getComuna().getNombre(),
                direccion.getComuna().getRegion().getNombre());
    }

    private BoundingBox boundingBox(BigDecimal latitud, BigDecimal longitud, int radiusMeters) {
        BigDecimal deltaLatitud = BigDecimal.valueOf(radiusMeters).divide(METERS_PER_LATITUDE_DEGREE, 12,
                RoundingMode.HALF_UP);
        double cosLatitud = Math.cos(Math.toRadians(latitud.doubleValue()));
        BigDecimal metersPerLongitudeDegree = METERS_PER_LATITUDE_DEGREE
                .multiply(BigDecimal.valueOf(Math.max(cosLatitud, 0.000001)));
        BigDecimal deltaLongitud = BigDecimal.valueOf(radiusMeters).divide(metersPerLongitudeDegree, 12,
                RoundingMode.HALF_UP);
        return new BoundingBox(
                latitud.subtract(deltaLatitud),
                latitud.add(deltaLatitud),
                longitud.subtract(deltaLongitud),
                longitud.add(deltaLongitud));
    }

    record BoundingBox(BigDecimal minLatitud, BigDecimal maxLatitud, BigDecimal minLongitud, BigDecimal maxLongitud) {
    }
}
