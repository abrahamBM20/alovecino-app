package com.alovecino.usuarioservice.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alovecino.usuarioservice.dto.ClienteResponse;
import com.alovecino.usuarioservice.dto.DireccionResponse;
import com.alovecino.usuarioservice.exception.UsuarioNotFoundException;
import com.alovecino.usuarioservice.model.Cliente;
import com.alovecino.usuarioservice.repository.ClienteRepository;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @Transactional(readOnly = true)
    public ClienteResponse getClienteById(Long idCliente) {
        return clienteRepository.findById(idCliente)
                .map(this::toResponse)
                .orElseThrow(() -> new UsuarioNotFoundException("cliente " + idCliente));
    }

    @Transactional(readOnly = true)
    public DireccionResponse getDireccionResponseById(Long idCliente) {
        return clienteRepository.findById(idCliente)
                .map(this::toDireccionResponse)
                .orElseThrow(() -> new UsuarioNotFoundException("cliente " + idCliente));
    }

    private ClienteResponse toResponse(Cliente cliente) {
        var direccion = cliente.getDireccion();
        return new ClienteResponse(
                cliente.getIdCliente(),
                direccion.getCalle(),
                direccion.getNumero(),
                direccion.getComuna().getNombre(),
                direccion.getComuna().getRegion().getNombre(),
                direccion.getCodigoPostal(),
                direccion.getLatitud() != null ? direccion.getLatitud().toPlainString() : null,
                direccion.getLongitud() != null ? direccion.getLongitud().toPlainString() : null);
    }

    private DireccionResponse toDireccionResponse(Cliente cliente) {
        var direccion = cliente.getDireccion();
        return new DireccionResponse(
                direccion.getCalle(),
                direccion.getNumero(),
                direccion.getComuna().getNombre(),
                direccion.getComuna().getRegion().getNombre(),
                direccion.getCodigoPostal(),
                direccion.getLatitud() != null ? direccion.getLatitud().toPlainString() : null,
                direccion.getLongitud() != null ? direccion.getLongitud().toPlainString() : null);
    }
}
