package com.alovecino.geoservice.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.alovecino.geoservice.model.Almacen;

public interface AlmacenGeoRepository extends JpaRepository<Almacen, Long> {

    @Query("""
            select a
            from Almacen a
            join fetch a.direccion d
            join fetch d.comuna c
            join fetch c.region
            join a.estadoCuenta ec
            where d.latitud is not null
              and d.longitud is not null
              and upper(ec.codigo) = 'ACTIVO'
              and d.latitud between :minLatitud and :maxLatitud
              and d.longitud between :minLongitud and :maxLongitud
            """)
    List<Almacen> findCandidatesWithinBoundingBox(
            @Param("minLatitud") BigDecimal minLatitud,
            @Param("maxLatitud") BigDecimal maxLatitud,
            @Param("minLongitud") BigDecimal minLongitud,
            @Param("maxLongitud") BigDecimal maxLongitud);
}
