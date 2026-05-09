package com.alovecino.usuarioservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.alovecino.usuarioservice.model.Almacen;

public interface AlmacenRepository extends JpaRepository<Almacen, Long> {

    List<Almacen> findByDuenoIdUsuarioOrderByIdAlmacenDesc(Long idUsuario);
}
