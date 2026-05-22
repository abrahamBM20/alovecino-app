package com.alovecino.usuarioservice.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.alovecino.usuarioservice.model.ConfiguracionUsuario;

public interface ConfiguracionUsuarioRepository extends JpaRepository<ConfiguracionUsuario, Long> {
    Optional<ConfiguracionUsuario> findByUsuarioIdUsuario(Long idUsuario);
}
