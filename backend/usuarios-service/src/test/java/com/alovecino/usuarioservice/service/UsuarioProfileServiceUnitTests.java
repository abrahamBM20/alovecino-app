package com.alovecino.usuarioservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.alovecino.usuarioservice.dto.UsuarioProfileResponse;
import com.alovecino.usuarioservice.exception.UsuarioNotFoundException;
import com.alovecino.usuarioservice.model.Almacen;
import com.alovecino.usuarioservice.model.Cliente;
import com.alovecino.usuarioservice.model.Comuna;
import com.alovecino.usuarioservice.model.ConfiguracionUsuario;
import com.alovecino.usuarioservice.model.Direccion;
import com.alovecino.usuarioservice.model.EstadoCuenta;
import com.alovecino.usuarioservice.model.Region;
import com.alovecino.usuarioservice.model.Rol;
import com.alovecino.usuarioservice.model.Usuario;
import com.alovecino.usuarioservice.repository.AlmacenRepository;
import com.alovecino.usuarioservice.repository.AlmacenContactoRepository;
import com.alovecino.usuarioservice.repository.ClienteRepository;
import com.alovecino.usuarioservice.repository.ComunaRepository;
import com.alovecino.usuarioservice.repository.ConfiguracionUsuarioRepository;
import com.alovecino.usuarioservice.repository.DireccionRepository;
import com.alovecino.usuarioservice.repository.EstadoCuentaRepository;
import com.alovecino.usuarioservice.repository.RegionRepository;
import com.alovecino.usuarioservice.repository.RolRepository;
import com.alovecino.usuarioservice.repository.TipoContactoRepository;
import com.alovecino.usuarioservice.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class UsuarioProfileServiceUnitTests {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private RolRepository rolRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private AlmacenRepository almacenRepository;

    @Mock
    private DireccionRepository direccionRepository;

    @Mock
    private RegionRepository regionRepository;

    @Mock
    private ComunaRepository comunaRepository;

    @Mock
    private EstadoCuentaRepository estadoCuentaRepository;

    @Mock
    private ConfiguracionUsuarioRepository configuracionUsuarioRepository;

    @Mock
    private TipoContactoRepository tipoContactoRepository;

    @Mock
    private AlmacenContactoRepository almacenContactoRepository;

    @Mock
    private RutValidator rutValidator;

    @Mock
    private GeocodingService geocodingService;

    @Mock
    private ImageService imageService;

    private UsuarioService usuarioService;

    @BeforeEach
    void setUp() {
        usuarioService = new UsuarioService(
                usuarioRepository,
                rolRepository,
                passwordEncoder,
                clienteRepository,
                almacenRepository,
                direccionRepository,
                regionRepository,
                comunaRepository,
                estadoCuentaRepository,
                configuracionUsuarioRepository,
                tipoContactoRepository,
                almacenContactoRepository,
                rutValidator,
                geocodingService,
                imageService);
    }

    @Test
    void shouldReturnCompleteClienteProfileById() {
        Usuario usuario = usuario(10L, "CLIENTE");
        Cliente cliente = cliente(usuario);

        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(usuario));
        when(clienteRepository.findByUsuarioIdUsuario(10L)).thenReturn(Optional.of(cliente));
        when(almacenRepository.findByDuenoIdUsuarioOrderByIdAlmacenDesc(10L)).thenReturn(List.of());

        UsuarioProfileResponse response = usuarioService.getUsuarioProfileById("10");

        assertThat(response.getIdUsuario()).isEqualTo(10L);
        assertThat(response.getUuid()).isEqualTo("10");
        assertThat(response.getRut()).isEqualTo("123456785");
        assertThat(response.getNombreUsuario()).isEqualTo("cliente.test");
        assertThat(response.getCorreo()).isEqualTo("cliente@alovecino.test");
        assertThat(response.getNombreRol()).isEqualTo("CLIENTE");
        assertThat(response.getFotoPerfil()).isEqualTo("https://res.cloudinary.com/demo/image/upload/perfil.jpg");
        assertThat(response.getCliente()).isNotNull();
        assertThat(response.getCliente().getFechaNacimiento()).isEqualTo(LocalDate.of(1990, 1, 1));
        assertThat(response.getCliente().getEstadoCuenta().getCodigo()).isEqualTo("ACTIVO");
        assertThat(response.getCliente().getDireccion().getComuna()).isEqualTo("Providencia");
        assertThat(response.getCliente().getDireccion().getRegion()).isEqualTo("Metropolitana de Santiago");
        assertThat(response.getAlmacenes()).isEmpty();
    }

    @Test
    void shouldReturnAlmacenProfileById() {
        Usuario usuario = usuario(20L, "ALMACEN");
        Almacen almacen = almacen(usuario);

        when(usuarioRepository.findById(20L)).thenReturn(Optional.of(usuario));
        when(clienteRepository.findByUsuarioIdUsuario(20L)).thenReturn(Optional.empty());
        when(almacenRepository.findByDuenoIdUsuarioOrderByIdAlmacenDesc(20L)).thenReturn(List.of(almacen));

        UsuarioProfileResponse response = usuarioService.getUsuarioProfileById("20");

        assertThat(response.getCliente()).isNull();
        assertThat(response.getAlmacenes()).hasSize(1);
        assertThat(response.getAlmacenes().getFirst().getNombre()).isEqualTo("Almacén Test");
        assertThat(response.getAlmacenes().getFirst().getEstadoCuenta().getCodigo()).isEqualTo("PENDIENTE");
        assertThat(response.getAlmacenes().getFirst().getDireccion().getCalle()).isEqualTo("Avenida Siempre Viva");
    }

    @Test
    void shouldUploadProfilePhotoAndSaveCloudinaryUrl() throws IOException {
        Usuario usuario = usuario(30L, "CLIENTE");
        MockMultipartFile image = new MockMultipartFile(
                "file",
                "perfil.png",
                "image/png",
                new byte[] { 1, 2, 3 });

        when(usuarioRepository.findById(30L)).thenReturn(Optional.of(usuario));
        when(imageService.uploadImage(image)).thenReturn("https://res.cloudinary.com/demo/image/upload/nueva.png");

        String url = usuarioService.uploadProfilePhoto("30", image);

        assertThat(url).isEqualTo("https://res.cloudinary.com/demo/image/upload/nueva.png");
        assertThat(usuario.getFotoPerfil()).isEqualTo(url);
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void shouldRejectProfilePhotoUploadWhenUsuarioDoesNotExist() throws IOException {
        MockMultipartFile image = new MockMultipartFile(
                "file",
                "perfil.png",
                "image/png",
                new byte[] { 1, 2, 3 });

        when(usuarioRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> usuarioService.uploadProfilePhoto("999", image))
                .isInstanceOf(UsuarioNotFoundException.class)
                .hasMessageContaining("999");

        verify(imageService, never()).uploadImage(any());
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    private Usuario usuario(Long id, String nombreRol) {
        Usuario usuario = new Usuario();
        ReflectionTestUtils.setField(usuario, "idUsuario", id);
        usuario.setRut("123456785");
        usuario.setNombreUsuario("cliente.test");
        usuario.setNombre("Cliente Test");
        usuario.setCorreo("cliente@alovecino.test");
        usuario.setContrasena("encoded-password");
        usuario.setFotoPerfil("https://res.cloudinary.com/demo/image/upload/perfil.jpg");
        usuario.setRol(new Rol(nombreRol));
        return usuario;
    }

    private Cliente cliente(Usuario usuario) {
        Cliente cliente = new Cliente();
        ReflectionTestUtils.setField(cliente, "idCliente", 100L);
        cliente.setUsuario(usuario);
        cliente.setFechaNacimiento(LocalDate.of(1990, 1, 1));
        cliente.setEstadoCuenta(new EstadoCuenta("ACTIVO", "Activo", "Cuenta activa"));
        cliente.setDireccion(direccion());
        return cliente;
    }

    private Almacen almacen(Usuario usuario) {
        Almacen almacen = new Almacen();
        almacen.setIdAlmacen(200L);
        almacen.setDueno(usuario);
        almacen.setNombre("Almacén Test");
        almacen.setEstadoCuenta(new EstadoCuenta("PENDIENTE", "Pendiente", "Pendiente de revisión"));
        almacen.setDireccion(direccion());
        return almacen;
    }

    private Direccion direccion() {
        Region region = new Region("Metropolitana de Santiago", "RM");
        Comuna comuna = new Comuna("Providencia", region);

        Direccion direccion = new Direccion();
        direccion.setCalle("Avenida Siempre Viva");
        direccion.setNumero("742");
        direccion.setCodigoPostal("7500000");
        direccion.setComuna(comuna);
        direccion.setLatitud(new BigDecimal("-33.4489000"));
        direccion.setLongitud(new BigDecimal("-70.6693000"));
        return direccion;
    }
}
