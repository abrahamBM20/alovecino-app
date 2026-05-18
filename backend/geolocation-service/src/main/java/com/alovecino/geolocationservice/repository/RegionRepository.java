package com.alovecino.geolocationservice.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.alovecino.geolocationservice.model.Region;

@Repository
public interface RegionRepository extends JpaRepository<Region, Long> {

    Optional<Region> findByNombreIgnoreCase(String nombre);

}
