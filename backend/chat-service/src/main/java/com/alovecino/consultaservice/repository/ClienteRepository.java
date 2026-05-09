package main.java.com.alovecino.consultaservice.repository;

import main.java.com.alovecino.consultaservice.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByIdUsuario(Long idUsuario);
}