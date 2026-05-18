package com.alovecino.geolocationservice.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.alovecino.geolocationservice.model.EstadoCuenta;

@Repository
public interface EstadoCuentaRepository extends JpaRepository<EstadoCuenta, Long> {

    Optional<EstadoCuenta> findByCodigoIgnoreCase(String codigo);

}
