package com.alovecino.usuarioservice.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.alovecino.usuarioservice.model.EstadoCuenta;

public interface EstadoCuentaRepository extends JpaRepository<EstadoCuenta, Long> {
    Optional<EstadoCuenta> findByCodigo(String codigo);
}
