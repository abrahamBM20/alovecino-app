package com.alovecino.usuarioservice.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.alovecino.usuarioservice.model.TipoContacto;

public interface TipoContactoRepository extends JpaRepository<TipoContacto, Long> {
    Optional<TipoContacto> findByCodigo(String codigo);
}
