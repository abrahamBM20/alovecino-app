package com.alovecino.usuarioservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.alovecino.usuarioservice.model.Direccion;

public interface DireccionRepository extends JpaRepository<Direccion, Long> {
}
