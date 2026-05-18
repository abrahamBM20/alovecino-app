package com.alovecino.geolocationservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.alovecino.geolocationservice.model.GeocodeAudit;

@Repository
public interface GeocodeAuditRepository extends JpaRepository<GeocodeAudit, Long> {

    @Query("SELECT COUNT(a) FROM GeocodeAudit a WHERE a.idUsuario = :idUsuario AND CAST(a.fechaLlamada AS date) = CURRENT_DATE")
    long countTodayByUsuario(@Param("idUsuario") Long idUsuario);
}
