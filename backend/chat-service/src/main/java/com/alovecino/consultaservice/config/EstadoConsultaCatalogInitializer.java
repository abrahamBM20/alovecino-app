package com.alovecino.consultaservice.config;

import com.alovecino.consultaservice.model.EstadoConsulta;
import com.alovecino.consultaservice.repository.EstadoConsultaRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class EstadoConsultaCatalogInitializer {

    @Bean
    ApplicationRunner inicializarCatalogoEstadosConsulta(EstadoConsultaRepository estadoConsultaRepository) {
        return args -> List.of(
                estado("PENDIENTE", "Consulta creada pero no respondida aún"),
                estado("RESPONDIDA", "Consulta que ha sido respondida por el almacén"),
                estado("CERRADA", "Consulta finalizada"),
                estado("CANCELADA", "Consulta cancelada por el cliente")
        ).forEach(estado -> {
            EstadoConsulta existente = estadoConsultaRepository.findByCodigo(estado.getCodigo());
            if (existente == null) {
                estadoConsultaRepository.save(estado);
            } else if (!estado.getNombre().equals(existente.getNombre())) {
                existente.setNombre(estado.getNombre());
                existente.setDescripcion(estado.getDescripcion());
                estadoConsultaRepository.save(existente);
            }
        });
    }

    private static EstadoConsulta estado(String codigo, String descripcion) {
        EstadoConsulta estado = new EstadoConsulta();
        estado.setCodigo(codigo);
        estado.setNombre(codigo);
        estado.setDescripcion(descripcion);
        return estado;
    }
}
