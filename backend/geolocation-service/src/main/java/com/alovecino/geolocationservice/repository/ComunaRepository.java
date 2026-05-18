package com.alovecino.geolocationservice.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.alovecino.geolocationservice.model.Comuna;
import com.alovecino.geolocationservice.model.Region;

@Repository
public interface ComunaRepository extends JpaRepository<Comuna, Long> {

    Optional<Comuna> findByNombreIgnoreCaseAndRegion(String nombre, Region region);

}
