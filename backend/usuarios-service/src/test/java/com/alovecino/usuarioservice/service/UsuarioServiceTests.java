package com.alovecino.usuarioservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import com.alovecino.usuarioservice.dto.DireccionRequest;
import com.alovecino.usuarioservice.dto.AlmacenRequest;
import com.alovecino.usuarioservice.dto.AlmacenResponse;
import com.alovecino.usuarioservice.dto.UsuarioRequest;
import com.alovecino.usuarioservice.dto.UsuarioRequest.TipoCuenta;
import com.alovecino.usuarioservice.dto.UsuarioResponse;
import com.alovecino.usuarioservice.repository.AlmacenContactoRepository;
import com.alovecino.usuarioservice.repository.AlmacenRepository;
import com.alovecino.usuarioservice.repository.ClienteRepository;
import com.alovecino.usuarioservice.repository.ConfiguracionUsuarioRepository;
import com.alovecino.usuarioservice.repository.DireccionRepository;
import com.alovecino.usuarioservice.repository.UsuarioRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UsuarioServiceTests {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private AlmacenService almacenService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private AlmacenRepository almacenRepository;

    @Autowired
    private AlmacenContactoRepository almacenContactoRepository;

    @Autowired
    private DireccionRepository direccionRepository;

    @Autowired
    private ConfiguracionUsuarioRepository configuracionUsuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void shouldCreateClienteWithDireccionConfiguracionAndBcryptPassword() {
        UsuarioRequest request = clienteRequest("123456785", "cliente-" + UUID.randomUUID() + "@alovecino.test",
                "cliente-" + UUID.randomUUID());

        UsuarioResponse saved = usuarioService.createUsuario(request);

        assertThat(saved).isNotNull();
        assertThat(saved.getRut()).isEqualTo("123456785");
        assertThat(saved.getNombreRol()).isEqualTo("CLIENTE");
        assertThat(usuarioRepository.findByNombreUsuario(saved.getNombreUsuario())).isPresent()
                .get()
                .satisfies(usuario -> {
                    assertThat(usuario.getCorreo()).isEqualTo(request.getCorreo());
                    assertThat(usuario.getContrasena()).startsWith("$2");
                    assertThat(passwordEncoder.matches(request.getContrasena(), usuario.getContrasena())).isTrue();
                });
        assertThat(clienteRepository.count()).isEqualTo(1);
        assertThat(direccionRepository.count()).isEqualTo(1);
        assertThat(configuracionUsuarioRepository.count()).isEqualTo(1);
        assertThat(direccionRepository.findAll().getFirst().getLatitud()).isNotNull();
        assertThat(direccionRepository.findAll().getFirst().getLongitud()).isNotNull();
    }

    @Test
    void shouldCreateAlmacenWithDireccionAndConfiguracion() {
        UsuarioRequest request = almacenRequest("222222222", "almacen-" + UUID.randomUUID() + "@alovecino.test",
                "dueno-" + UUID.randomUUID());

        UsuarioResponse saved = usuarioService.createUsuario(request);

        assertThat(saved.getNombreRol()).isEqualTo("ALMACEN");
        assertThat(almacenRepository.count()).isEqualTo(1);
        assertThat(configuracionUsuarioRepository.count()).isEqualTo(1);
        assertThat(direccionRepository.findAll().getFirst().getLatitud()).isNotNull();
        assertThat(almacenRepository.findAll().getFirst().getEstadoCuenta().getCodigo()).isEqualTo("PENDIENTE");
    }

    @Test
    void shouldUpdateAlmacenProfileDireccionAndTelefono() {
        UsuarioRequest request = almacenRequest("222222222", "almacen-" + UUID.randomUUID() + "@alovecino.test",
                "dueno-" + UUID.randomUUID());
        UsuarioResponse saved = usuarioService.createUsuario(request);
        Long idAlmacen = almacenRepository.findAll().getFirst().getIdAlmacen();

        AlmacenRequest update = new AlmacenRequest();
        update.setNombre("Botillería Queltehues Sur");
        update.setTelefono("+56911112222");
        DireccionRequest direccion = new DireccionRequest();
        direccion.setCalle("Pasaje Los Queltehues");
        direccion.setNumero("1450");
        direccion.setComuna("Peñalolén");
        direccion.setRegion("Metropolitana de Santiago");
        direccion.setCodigoPostal("7910000");
        update.setDireccion(direccion);

        AlmacenResponse response = almacenService.updateAlmacen(String.valueOf(saved.getIdUsuario()), idAlmacen,
                update);

        assertThat(response.getNombre()).isEqualTo("Botillería Queltehues Sur");
        assertThat(response.getTelefono()).isEqualTo("+56911112222");
        assertThat(response.getCalle()).isEqualTo("Pasaje Los Queltehues");
        assertThat(response.getNumero()).isEqualTo("1450");
        assertThat(response.getCodigoPostal()).isEqualTo("7910000");
        assertThat(response.getComuna()).isEqualTo("Peñalolén");
        assertThat(almacenContactoRepository
                .findFirstByAlmacenIdAlmacenAndEsPrincipalTrueOrderByIdAlmacenContactoAsc(idAlmacen))
                .isPresent()
                .get()
                .satisfies(contacto -> {
                    assertThat(contacto.getValor()).isEqualTo("+56911112222");
                    assertThat(contacto.getNombreContacto()).isEqualTo("Botillería Queltehues Sur");
                });
    }

    @Test
    void shouldRejectDuplicateRutCorreoAndNombreUsuario() {
        UsuarioRequest original = clienteRequest("333333333", "original-" + UUID.randomUUID() + "@alovecino.test",
                "original-" + UUID.randomUUID());
        usuarioService.createUsuario(original);

        UsuarioRequest duplicateRut = clienteRequest(original.getRut(), "otro-" + UUID.randomUUID() + "@alovecino.test",
                "otro-" + UUID.randomUUID());
        UsuarioRequest duplicateCorreo = clienteRequest("444444444", original.getCorreo(),
                "correo-" + UUID.randomUUID());
        UsuarioRequest duplicateNombreUsuario = clienteRequest("555555555",
                "nombre-" + UUID.randomUUID() + "@alovecino.test", original.getNombreUsuario());

        assertThatThrownBy(() -> usuarioService.createUsuario(duplicateRut))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("RUT");
        assertThatThrownBy(() -> usuarioService.createUsuario(duplicateCorreo))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("correo");
        assertThatThrownBy(() -> usuarioService.createUsuario(duplicateNombreUsuario))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("nombre de usuario");
    }

    @Test
    void shouldRejectInvalidRut() {
        UsuarioRequest request = clienteRequest("123456789", "rut-" + UUID.randomUUID() + "@alovecino.test",
                "rut-" + UUID.randomUUID());

        assertThatThrownBy(() -> usuarioService.createUsuario(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("RUT");
    }

    private UsuarioRequest clienteRequest(String rut, String correo, String nombreUsuario) {
        UsuarioRequest request = new UsuarioRequest();
        request.setRut(rut);
        request.setNombreUsuario(nombreUsuario);
        request.setNombre("Cliente Test");
        request.setCorreo(correo);
        request.setContrasena("Password123");
        request.setTipoCuenta(TipoCuenta.CLIENTE);
        request.setFechaNacimiento(LocalDate.of(1990, 1, 1));
        request.setDireccion(direccion());
        return request;
    }

    private UsuarioRequest almacenRequest(String rut, String correo, String nombreUsuario) {
        UsuarioRequest request = clienteRequest(rut, correo, nombreUsuario);
        request.setTipoCuenta(TipoCuenta.ALMACEN);
        request.setFechaNacimiento(null);
        request.setNombre("Dueño Almacén");
        request.setNombreAlmacen("Almacén Test");
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

    @AfterEach
    void tearDown() {
        almacenContactoRepository.deleteAll();
        almacenRepository.deleteAll();
        clienteRepository.deleteAll();
        configuracionUsuarioRepository.deleteAll();
        direccionRepository.deleteAll();
        usuarioRepository.deleteAll();
    }
}

