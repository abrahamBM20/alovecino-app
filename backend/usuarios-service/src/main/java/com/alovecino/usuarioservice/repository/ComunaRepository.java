package com.alovecino.usuarioservice.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.alovecino.usuarioservice.model.Comuna;
import com.alovecino.usuarioservice.model.Region;

public interface ComunaRepository extends JpaRepository<Comuna, Long> {
    Optional<Comuna> findByNombreIgnoreCaseAndRegion(String nombre, Region region);
}
