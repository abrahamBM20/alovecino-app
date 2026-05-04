package com.alovecino.usuarioservice.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import com.alovecino.usuarioservice.dto.DireccionRequest;
import com.alovecino.usuarioservice.dto.UsuarioRequest;
import com.alovecino.usuarioservice.dto.UsuarioRequest.TipoCuenta;
import com.alovecino.usuarioservice.model.Almacen;
import com.alovecino.usuarioservice.model.Cliente;
import com.alovecino.usuarioservice.model.ConfiguracionUsuario;
import com.alovecino.usuarioservice.model.Direccion;
import com.alovecino.usuarioservice.model.Usuario;
import com.alovecino.usuarioservice.repository.AlmacenRepository;
import com.alovecino.usuarioservice.repository.ClienteRepository;
import com.alovecino.usuarioservice.repository.ConfiguracionUsuarioRepository;
import com.alovecino.usuarioservice.repository.UsuarioRepository;

@SpringBootTest
@EnabledIfSystemProperty(named = "neonSmoke", matches = "true")
@Transactional
class NeonSmokeTests {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private AlmacenRepository almacenRepository;

    @Autowired
    private ConfiguracionUsuarioRepository configuracionUsuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PersistenceContext
    private EntityManager entityManager;

    @Test
    void shouldRegisterClienteAlmacenAndRelatedEntitiesAgainstNeonSchema() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        UsuarioRequest clienteRequest = clienteRequest(validRutFrom(70000000), "av75-cliente-" + suffix);
        UsuarioRequest almacenRequest = almacenRequest(validRutFrom(71000000), "av75-almacen-" + suffix);

        usuarioService.createUsuario(clienteRequest);
        usuarioService.createUsuario(almacenRequest);
        entityManager.flush();

        Usuario clienteUsuario = usuarioRepository.findByCorreo(clienteRequest.getCorreo()).orElseThrow();
        Usuario almacenUsuario = usuarioRepository.findByCorreo(almacenRequest.getCorreo()).orElseThrow();
        Long clienteUsuarioId = clienteUsuario.getIdUsuario();
        Long almacenUsuarioId = almacenUsuario.getIdUsuario();

        Cliente cliente = clienteRepository.findByUsuarioIdUsuario(clienteUsuarioId).orElseThrow();
        Almacen almacen = almacenRepository.findByDuenoIdUsuarioOrderByIdAlmacenDesc(almacenUsuarioId).getFirst();
        ConfiguracionUsuario clienteConfig = configuracionUsuarioRepository.findByUsuarioIdUsuario(clienteUsuarioId)
                .orElseThrow();
        ConfiguracionUsuario almacenConfig = configuracionUsuarioRepository.findByUsuarioIdUsuario(almacenUsuarioId)
                .orElseThrow();
        Direccion clienteDireccion = cliente.getDireccion();
        Direccion almacenDireccion = almacen.getDireccion();

        assertThat(clienteUsuario.getRol().getNombreRol()).isEqualTo("CLIENTE");
        assertThat(almacenUsuario.getRol().getNombreRol()).isEqualTo("ALMACEN");
        assertThat(clienteUsuario.getRol().getIdRol()).isEqualTo(1L);
        assertThat(almacenUsuario.getRol().getIdRol()).isEqualTo(2L);
        assertThat(passwordEncoder.matches(clienteRequest.getContrasena(), clienteUsuario.getContrasena())).isTrue();
        assertThat(clienteUsuario.getContrasena()).startsWith("$2");
        assertThat(cliente.getEstadoCuenta().getCodigo()).isEqualTo("ACTIVO");
        assertThat(almacen.getEstadoCuenta().getCodigo()).isEqualTo("PENDIENTE");
        assertThat(clienteConfig.getIdConfiguracionUsuario()).isNotNull();
        assertThat(almacenConfig.getIdConfiguracionUsuario()).isNotNull();
        assertThat(clienteDireccion.getLatitud()).isNotNull();
        assertThat(clienteDireccion.getLongitud()).isNotNull();
        assertThat(almacenDireccion.getLatitud()).isNotNull();
        assertThat(almacenDireccion.getLongitud()).isNotNull();

        assertRelatedStoreEntities(almacen.getIdAlmacen(), cliente.getIdCliente(), suffix);
    }

    private void assertRelatedStoreEntities(Long idAlmacen, Long idCliente, String suffix) {
        Long tipoContactoId = jdbcTemplate.queryForObject(
                "select id_tipo_contacto from tipo_contacto where codigo = 'TELEFONO'", Long.class);
        Long contactoId = jdbcTemplate.queryForObject("""
                insert into almacen_contacto (id_almacen, id_tipo_contacto, valor, nombre_contacto, es_principal)
                values (?, ?, ?, ?, true)
                returning id_almacen_contacto
                """, Long.class, idAlmacen, tipoContactoId, "+569" + suffix.replaceAll("\\D", "1"),
                "Contacto smoke");

        Long categoriaId = jdbcTemplate.queryForObject("""
                insert into categoria_almacen (nombre, descripcion)
                values (?, ?)
                on conflict (nombre) do update set descripcion = excluded.descripcion
                returning id_categoria_almacen
                """, Long.class, "Smoke AV-75 " + suffix, "Categoria smoke");
        Long almacenCategoriaId = jdbcTemplate.queryForObject("""
                insert into almacen_categoria (id_almacen, id_categoria_almacen)
                values (?, ?)
                returning id_almacen_categoria
                """, Long.class, idAlmacen, categoriaId);

        Long horarioId = jdbcTemplate.queryForObject("""
                insert into almacen_horario (id_almacen, dia_semana, hora_apertura, hora_cierre, cerrado)
                values (?, 1, '09:00', '18:00', false)
                returning id_almacen_horario
                """, Long.class, idAlmacen);

        Long tipoImagenId = jdbcTemplate.queryForObject("select id_tipo_imagen from tipo_imagen where codigo = 'LOGO'",
                Long.class);
        Long imagenId = jdbcTemplate.queryForObject("""
                insert into almacen_imagen (id_almacen, id_tipo_imagen, url, orden)
                values (?, ?, ?, 0)
                returning id_almacen_imagen
                """, Long.class, idAlmacen, tipoImagenId, "https://example.test/logo-" + suffix + ".png");

        Long estadoConsultaId = jdbcTemplate.queryForObject(
                "select id_estado_consulta from estado_consulta where codigo = 'ABIERTA'", Long.class);
        Long consultaId = jdbcTemplate.queryForObject("""
                insert into consulta (id_cliente, id_almacen, id_estado_consulta, respuesta, fecha_respuesta)
                values (?, ?, ?, ?, ?)
                returning id_consulta
                """, Long.class, idCliente, idAlmacen, estadoConsultaId, "Respuesta smoke",
                OffsetDateTime.now());
        Long consultaDetalleId = jdbcTemplate.queryForObject("""
                insert into consulta_detalle (id_consulta, descripcion, cantidad_solicitada)
                values (?, ?, 2)
                returning id_consulta_detalle
                """, Long.class, consultaId, "Producto smoke");

        Long valoracionId = jdbcTemplate.queryForObject("""
                insert into valoracion (cantidad_estrellas, contenido, id_cliente, id_almacen)
                values (5, ?, ?, ?)
                returning id_valoracion
                """, Long.class, "Valoracion smoke", idCliente, idAlmacen);
        Integer valoracionUniqueConstraint = jdbcTemplate.queryForObject("""
                select count(*)
                from pg_constraint
                where conname = 'uk_valoracion_cliente_almacen'
                """, Integer.class);

        Long ofertaId = jdbcTemplate.queryForObject("""
                insert into oferta (id_almacen, titulo, descripcion, radio_km, fecha_inicio, activa)
                values (?, ?, ?, 3.50, ?, true)
                returning id_oferta
                """, Long.class, idAlmacen, "Oferta smoke " + suffix, "Oferta de prueba",
                OffsetDateTime.now());
        Long ofertaCategoriaId = jdbcTemplate.queryForObject("""
                insert into oferta_categoria (id_oferta, id_categoria_almacen)
                values (?, ?)
                returning id_oferta_categoria
                """, Long.class, ofertaId, categoriaId);

        Long preferenciaId = jdbcTemplate.queryForObject("""
                insert into cliente_categoria_interes (id_cliente, id_categoria_almacen)
                values (?, ?)
                returning id_cliente_categoria_interes
                """, Long.class, idCliente, categoriaId);

        assertThat(contactoId).isNotNull();
        assertThat(almacenCategoriaId).isNotNull();
        assertThat(horarioId).isNotNull();
        assertThat(imagenId).isNotNull();
        assertThat(consultaId).isNotNull();
        assertThat(consultaDetalleId).isNotNull();
        assertThat(valoracionId).isNotNull();
        assertThat(valoracionUniqueConstraint).isEqualTo(1);
        assertThat(ofertaId).isNotNull();
        assertThat(ofertaCategoriaId).isNotNull();
        assertThat(preferenciaId).isNotNull();
    }

    private UsuarioRequest clienteRequest(String rut, String prefix) {
        UsuarioRequest request = new UsuarioRequest();
        request.setRut(rut);
        request.setNombreUsuario(prefix);
        request.setNombre("Smoke Cliente");
        request.setCorreo(prefix + "@alovecino.test");
        request.setContrasena("Password123");
        request.setTipoCuenta(TipoCuenta.CLIENTE);
        request.setFechaNacimiento(LocalDate.of(1991, 5, 12));
        request.setDireccion(direccion("Cliente " + prefix));
        return request;
    }

    private UsuarioRequest almacenRequest(String rut, String prefix) {
        UsuarioRequest request = clienteRequest(rut, prefix);
        request.setTipoCuenta(TipoCuenta.ALMACEN);
        request.setFechaNacimiento(null);
        request.setNombre("Smoke Dueno Almacen");
        request.setNombreAlmacen("Smoke Almacen " + prefix);
        request.setDireccion(direccion("Almacen " + prefix));
        return request;
    }

    private DireccionRequest direccion(String calle) {
        DireccionRequest direccion = new DireccionRequest();
        direccion.setCalle(calle);
        direccion.setNumero("123");
        direccion.setComuna("Santiago");
        direccion.setRegion("RM");
        direccion.setCodigoPostal("8320000");
        return direccion;
    }

    private String validRutFrom(int body) {
        int multiplier = 2;
        int sum = 0;
        String digits = String.valueOf(body);
        for (int i = digits.length() - 1; i >= 0; i--) {
            sum += Character.digit(digits.charAt(i), 10) * multiplier;
            multiplier = multiplier == 7 ? 2 : multiplier + 1;
        }
        int value = 11 - (sum % 11);
        String verifier = switch (value) {
            case 11 -> "0";
            case 10 -> "K";
            default -> String.valueOf(value);
        };
        return digits + verifier;
    }
}
