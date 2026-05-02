package com.alovecino.usuarioservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.alovecino.usuarioservice.model.Almacen;

public interface AlmacenRepository extends JpaRepository<Almacen, Long> {

    List<Almacen> findByDuenoUuidOrderByIdAlmacenDesc(String duenoUuid);

    Optional<Almacen> findByUuid(String uuid);
}
