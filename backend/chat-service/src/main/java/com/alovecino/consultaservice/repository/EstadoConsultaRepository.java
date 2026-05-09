package main.java.com.alovecino.consultaservice.repository;

import main.java.com.alovecino.consultaservice.model.EstadoConsulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstadoConsultaRepository extends JpaRepository<EstadoConsulta, Long> {

    EstadoConsulta findByNombre(String nombre);
}