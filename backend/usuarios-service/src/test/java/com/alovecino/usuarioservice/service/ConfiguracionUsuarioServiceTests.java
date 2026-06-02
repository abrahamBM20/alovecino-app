package com.alovecino.usuarioservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;

import com.alovecino.usuarioservice.dto.ConfiguracionUsuarioRequest;
import com.alovecino.usuarioservice.dto.ConfiguracionUsuarioResponse;
import com.alovecino.usuarioservice.dto.DireccionRequest;
import com.alovecino.usuarioservice.dto.UsuarioRequest;
import com.alovecino.usuarioservice.dto.UsuarioRequest.TipoCuenta;
import com.alovecino.usuarioservice.dto.UsuarioResponse;
import com.alovecino.usuarioservice.repository.ClienteRepository;
import com.alovecino.usuarioservice.repository.ConfiguracionUsuarioRepository;
import com.alovecino.usuarioservice.repository.DireccionRepository;
import com.alovecino.usuarioservice.repository.UsuarioRepository;

@SpringBootTest
@Transactional
class ConfiguracionUsuarioServiceTests {

    @Autowired
    private ConfiguracionUsuarioService configuracionUsuarioService;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private ConfiguracionUsuarioRepository configuracionUsuarioRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private DireccionRepository direccionRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Test
    void shouldReturnDefaultConfigurationForAuthenticatedUser() {
        UsuarioResponse usuario = usuarioService.createUsuario(clienteRequest());

        ConfiguracionUsuarioResponse response = configuracionUsuarioService.getConfiguracion(
                usuario.getIdUsuario(), usuario.getIdUsuario().toString());

        assertThat(response.getIdUsuario()).isEqualTo(usuario.getIdUsuario());
        assertThat(response.isNotificacionesPush()).isTrue();
        assertThat(response.isNotificacionesEmail()).isFalse();
        assertThat(response.isRecibirOfertas()).isTrue();
        assertThat(response.isPerfilVisible()).isTrue();
        assertThat(response.getRadioOfertasKm()).isEqualByComparingTo("3.00");
    }

    @Test
    void shouldUpdateAuthenticatedUserConfiguration() {
        UsuarioResponse usuario = usuarioService.createUsuario(clienteRequest());
        ConfiguracionUsuarioRequest request = configuracionRequest(false, true, false, false, "1.50");

        ConfiguracionUsuarioResponse response = configuracionUsuarioService.updateConfiguracion(
                usuario.getIdUsuario(), usuario.getIdUsuario().toString(), request);

        assertThat(response.isNotificacionesPush()).isFalse();
        assertThat(response.isNotificacionesEmail()).isTrue();
        assertThat(response.isRecibirOfertas()).isFalse();
        assertThat(response.isPerfilVisible()).isFalse();
        assertThat(response.getRadioOfertasKm()).isEqualByComparingTo("1.50");
        assertThat(configuracionUsuarioRepository.findByUsuarioIdUsuario(usuario.getIdUsuario())).isPresent()
                .get()
                .satisfies(configuracion -> {
                    assertThat(configuracion.isNotificacionesEmail()).isTrue();
                    assertThat(configuracion.getRadioOfertasKm()).isEqualByComparingTo("1.50");
                });
    }

    @Test
    void shouldRejectConfigurationAccessForDifferentUser() {
        UsuarioResponse usuario = usuarioService.createUsuario(clienteRequest());
        UsuarioResponse otherUser = usuarioService.createUsuario(clienteRequest());

        assertThatThrownBy(() -> configuracionUsuarioService.getConfiguracion(
                usuario.getIdUsuario(), otherUser.getIdUsuario().toString()))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("otro usuario");
    }

    private UsuarioRequest clienteRequest() {
        String suffix = UUID.randomUUID().toString();
        UsuarioRequest request = new UsuarioRequest();
        request.setRut(rutFromNumber(10_000_000 + Math.abs(suffix.hashCode() % 70_000_000)));
        request.setNombreUsuario("cliente-config-" + suffix);
        request.setNombre("Cliente Config");
        request.setCorreo("cliente-config-" + suffix + "@alovecino.test");
        request.setContrasena("Password123");
        request.setTipoCuenta(TipoCuenta.CLIENTE);
        request.setFechaNacimiento(LocalDate.of(1990, 1, 1));
        request.setDireccion(direccion());
        return request;
    }

    private DireccionRequest direccion() {
        DireccionRequest direccion = new DireccionRequest();
        direccion.setCalle("Avenida Siempre Viva");
        direccion.setNumero("742");
        direccion.setComuna("Providencia");
        direccion.setRegion("RM");
        direccion.setCodigoPostal("7500000");
        return direccion;
    }

    private ConfiguracionUsuarioRequest configuracionRequest(boolean push, boolean email, boolean ofertas,
            boolean perfilVisible, String radioKm) {
        ConfiguracionUsuarioRequest request = new ConfiguracionUsuarioRequest();
        request.setNotificacionesPush(push);
        request.setNotificacionesEmail(email);
        request.setRecibirOfertas(ofertas);
        request.setPerfilVisible(perfilVisible);
        request.setRadioOfertasKm(new BigDecimal(radioKm));
        return request;
    }

    private String rutFromNumber(int number) {
        int sum = 0;
        int multiplier = 2;
        int current = number;

        while (current > 0) {
            sum += (current % 10) * multiplier;
            current /= 10;
            multiplier = multiplier == 7 ? 2 : multiplier + 1;
        }

        int check = 11 - (sum % 11);
        String dv = switch (check) {
            case 11 -> "0";
            case 10 -> "K";
            default -> String.valueOf(check);
        };
        return number + dv;
    }

    @AfterEach
    void tearDown() {
        clienteRepository.deleteAll();
        configuracionUsuarioRepository.deleteAll();
        direccionRepository.deleteAll();
        usuarioRepository.deleteAll();
    }
}
