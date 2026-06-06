package com.alovecino.consultaservice.repository;

import com.alovecino.consultaservice.model.EstadoConsulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstadoConsultaRepository extends JpaRepository<EstadoConsulta, Long> {

    EstadoConsulta findByNombre(String nombre);

    EstadoConsulta findByCodigo(String codigo);
}
