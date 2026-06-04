package com.alovecino.usuarioservice.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.alovecino.usuarioservice.model.AlmacenContacto;

public interface AlmacenContactoRepository extends JpaRepository<AlmacenContacto, Long> {

    Optional<AlmacenContacto> findFirstByAlmacenIdAlmacenAndEsPrincipalTrueOrderByIdAlmacenContactoAsc(Long idAlmacen);
}
