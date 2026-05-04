package com.alovecino.authservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.alovecino.authservice.model.SesionUsuario;

public interface SesionUsuarioRepository extends JpaRepository<SesionUsuario, Long> {
}
