package com.alovecino.geolocationservice.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class UsuariosServiceClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public UsuariosServiceClient(RestTemplate restTemplate,
            @Value("${usuarios.service.url:http://usuarios-service:8080}") String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
    }

    public UsuariosServiceAddressResponse getAlmacenAddress(Long idAlmacen) {
        return restTemplate.getForObject(baseUrl + "/api/internal/geolocalizacion/almacenes/{id}",
                UsuariosServiceAddressResponse.class, idAlmacen);
    }

    public UsuariosServiceAddressResponse getClienteAddress(Long idCliente) {
        return restTemplate.getForObject(baseUrl + "/api/internal/geolocalizacion/clientes/{id}",
                UsuariosServiceAddressResponse.class, idCliente);
    }
}
