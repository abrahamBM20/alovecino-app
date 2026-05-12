package com.alovecino.consultaservice.repository;

import com.alovecino.consultaservice.model.ConfiguracionUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfiguracionUsuarioRepository extends JpaRepository<ConfiguracionUsuario, Long> {

    Optional<ConfiguracionUsuario> findByIdUsuario(Long idUsuario);
}
