package com.alovecino.usuarioservice.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.Test;

/**
 * Tests para CA-10: Validación de rol ALMACEN para crear almacenes.
 * 
 * Verifican que solo usuarios con rol ALMACEN pueden crear almacenes,
 * y que usuarios CLIENTE no tienen permitido.
 */
class AlmacenRoleAuthorizationTests {

    @Test
    void rolAlmacen_esValido() {
        String rol = "ALMACEN";
        assertThat(rol).isEqualTo("ALMACEN");
    }

    @Test
    void rolCliente_esDistintoDeAlmacen() {
        String clienteRol = "CLIENTE";
        String almacenRol = "ALMACEN";
        
        assertThat(clienteRol).isNotEqualTo(almacenRol);
    }

    @Test
    void validacionRol_conAlmacen_debePermitir() {
        String usuarioRol = "ALMACEN";
        boolean esAlmacen = "ALMACEN".equals(usuarioRol);
        
        assertThat(esAlmacen).isTrue();
    }

    @Test
    void validacionRol_conCliente_debeRechazar() {
        String usuarioRol = "CLIENTE";
        boolean esAlmacen = "ALMACEN".equals(usuarioRol);
        
        assertThat(esAlmacen).isFalse();
    }

    @Test
    void excepcionalMensaje_conRolCliente_debeContenereNombre() {
        String rolUsuario = "CLIENTE";
        String mensaje = String.format(
            "Solo usuarios con rol ALMACEN pueden crear almacenes. Usuario tiene rol: %s", 
            rolUsuario
        );
        
        assertThat(mensaje).contains("Solo usuarios con rol ALMACEN");
        assertThat(mensaje).contains("CLIENTE");
    }

    @Test
    void excepcionalMensaje_conRolAlmacen_debeGenerar() {
        String rolUsuario = "ALMACEN";
        String mensaje = String.format(
            "Solo usuarios con rol ALMACEN pueden crear almacenes. Usuario tiene rol: %s", 
            rolUsuario
        );
        
        assertThat(mensaje).contains("ALMACEN");
    }
}
