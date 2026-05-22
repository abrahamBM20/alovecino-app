package com.alovecino.usuarioservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.alovecino.usuarioservice.model.Valoracion;

public interface ValoracionRepository extends JpaRepository<Valoracion, Long> {

    List<Valoracion> findByAlmacenIdAlmacenOrderByIdValoracionDesc(Long idAlmacen);

    List<Valoracion> findByClienteIdClienteOrderByIdValoracionDesc(Long idCliente);

    Optional<Valoracion> findByClienteIdClienteAndAlmacenIdAlmacen(Long idCliente, Long idAlmacen);

    boolean existsByClienteIdClienteAndAlmacenIdAlmacen(Long idCliente, Long idAlmacen);

    @Query("SELECT AVG(v.cantidadEstrellas) FROM Valoracion v WHERE v.almacen.idAlmacen = :idAlmacen")
    Optional<Double> findPromedioEstrellasByAlmacen(@Param("idAlmacen") Long idAlmacen);
}
