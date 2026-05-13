package com.alovecino.geolocationservice.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.alovecino.geolocationservice.model.Almacen;

@Repository
public interface AlmacenRepository extends JpaRepository<Almacen, Long> {

    @Query(value = "SELECT a.id_almacen AS idAlmacen, a.nombre AS nombre, "
            + "d.calle AS calle, d.numero AS numero, c.nombre AS comuna, r.nombre AS region, "
            + "d.latitud AS latitud, d.longitud AS longitud, "
            + "(6371 * acos(LEAST(1, GREATEST(-1, "
            + "cos(radians(:lat)) * cos(radians(d.latitud)) * cos(radians(d.longitud) - radians(:lng)) + "
            + "sin(radians(:lat)) * sin(radians(d.latitud))))) )) AS distanciaKm "
            + "FROM almacen a "
            + "JOIN direccion d ON d.id_direccion = a.id_direccion "
            + "JOIN comuna c ON c.id_comuna = d.id_comuna "
            + "JOIN region r ON r.id_region = c.id_region "
            + "JOIN estado_cuenta e ON e.id_estado_cuenta = a.id_estado_cuenta "
            + "WHERE d.latitud IS NOT NULL "
            + "AND d.longitud IS NOT NULL "
            + "AND e.codigo = 'ACTIVO' "
            + "AND (6371 * acos(LEAST(1, GREATEST(-1, "
            + "cos(radians(:lat)) * cos(radians(d.latitud)) * cos(radians(d.longitud) - radians(:lng)) + "
            + "sin(radians(:lat)) * sin(radians(d.latitud))))) )) <= :radioKm "
            + "ORDER BY distanciaKm ASC",
            nativeQuery = true)
    List<AlmacenNearbyProjection> findNearby(@Param("lat") BigDecimal lat, @Param("lng") BigDecimal lng,
            @Param("radioKm") double radioKm);

    interface AlmacenNearbyProjection {

        Long getIdAlmacen();

        String getNombre();

        String getCalle();

        String getNumero();

        String getComuna();

        String getRegion();

        BigDecimal getLatitud();

        BigDecimal getLongitud();

        Double getDistanciaKm();
    }
}
