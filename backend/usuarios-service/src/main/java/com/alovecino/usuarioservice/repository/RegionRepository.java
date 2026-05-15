package com.alovecino.usuarioservice.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.alovecino.usuarioservice.model.Region;

public interface RegionRepository extends JpaRepository<Region, Long> {
    Optional<Region> findByNombreIgnoreCaseOrCodigoIgnoreCase(String nombre, String codigo);
}
