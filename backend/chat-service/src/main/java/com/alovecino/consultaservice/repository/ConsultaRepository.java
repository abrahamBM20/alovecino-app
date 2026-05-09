package main.java.com.alovecino.consultaservice.repository;

import main.java.com.alovecino.consultaservice.model.Consulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultaRepository extends JpaRepository<Consulta, Long> {

    @Query("SELECT c FROM Consulta c WHERE c.idCliente = :idCliente ORDER BY c.createdAt DESC")
    List<Consulta> findConsultasByCliente(@Param("idCliente") Long idCliente);

    @Query("SELECT c FROM Consulta c WHERE c.idAlmacen = :idAlmacen ORDER BY c.createdAt DESC")
    List<Consulta> findConsultasByAlmacen(@Param("idAlmacen") Long idAlmacen);

    @Query("SELECT c FROM Consulta c WHERE c.idEstadoConsulta = :idEstadoConsulta ORDER BY c.createdAt DESC")
    List<Consulta> findConsultasByEstado(@Param("idEstadoConsulta") Long idEstadoConsulta);

    @Query("SELECT c FROM Consulta c WHERE c.idCliente = :idCliente AND c.idAlmacen = :idAlmacen ORDER BY c.createdAt DESC")
    List<Consulta> findConsultasByClienteAndAlmacen(@Param("idCliente") Long idCliente, @Param("idAlmacen") Long idAlmacen);
}