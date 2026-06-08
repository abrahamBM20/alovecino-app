package com.alovecino.usuarioservice.service;

import java.io.IOException;
import java.text.Normalizer;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.alovecino.usuarioservice.dto.AlmacenProfileResponse;
import com.alovecino.usuarioservice.dto.ClienteProfileResponse;
import com.alovecino.usuarioservice.dto.DireccionRequest;
import com.alovecino.usuarioservice.dto.DireccionResponse;
import com.alovecino.usuarioservice.dto.EstadoCuentaResponse;
import com.alovecino.usuarioservice.dto.UsuarioProfileResponse;
import com.alovecino.usuarioservice.dto.UsuarioRequest;
import com.alovecino.usuarioservice.dto.UsuarioResponse;
import com.alovecino.usuarioservice.exception.UsuarioNotFoundException;
import com.alovecino.usuarioservice.model.Almacen;
import com.alovecino.usuarioservice.model.AlmacenContacto;
import com.alovecino.usuarioservice.model.Cliente;
import com.alovecino.usuarioservice.model.Comuna;
import com.alovecino.usuarioservice.model.ConfiguracionUsuario;
import com.alovecino.usuarioservice.model.Direccion;
import com.alovecino.usuarioservice.model.EstadoCuenta;
import com.alovecino.usuarioservice.model.Region;
import com.alovecino.usuarioservice.model.Rol;
import com.alovecino.usuarioservice.model.TipoContacto;
import com.alovecino.usuarioservice.model.Usuario;
import com.alovecino.usuarioservice.repository.AlmacenContactoRepository;
import com.alovecino.usuarioservice.repository.AlmacenRepository;
import com.alovecino.usuarioservice.repository.ClienteRepository;
import com.alovecino.usuarioservice.repository.ComunaRepository;
import com.alovecino.usuarioservice.repository.ConfiguracionUsuarioRepository;
import com.alovecino.usuarioservice.repository.DireccionRepository;
import com.alovecino.usuarioservice.repository.EstadoCuentaRepository;
import com.alovecino.usuarioservice.repository.RegionRepository;
import com.alovecino.usuarioservice.repository.RolRepository;
import com.alovecino.usuarioservice.repository.TipoContactoRepository;
import com.alovecino.usuarioservice.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final ClienteRepository clienteRepository;
    private final AlmacenRepository almacenRepository;
    private final DireccionRepository direccionRepository;
    private final RegionRepository regionRepository;
    private final ComunaRepository comunaRepository;
    private final EstadoCuentaRepository estadoCuentaRepository;
    private final ConfiguracionUsuarioRepository configuracionUsuarioRepository;
    private final TipoContactoRepository tipoContactoRepository;
    private final AlmacenContactoRepository almacenContactoRepository;
    private final RutValidator rutValidator;
    private final GeocodingService geocodingService;
    private final ImageService imageService;

    public UsuarioService(UsuarioRepository usuarioRepository, RolRepository rolRepository,
            PasswordEncoder passwordEncoder, ClienteRepository clienteRepository, AlmacenRepository almacenRepository,
            DireccionRepository direccionRepository, RegionRepository regionRepository, ComunaRepository comunaRepository,
            EstadoCuentaRepository estadoCuentaRepository,
            ConfiguracionUsuarioRepository configuracionUsuarioRepository, TipoContactoRepository tipoContactoRepository,
            AlmacenContactoRepository almacenContactoRepository, RutValidator rutValidator,
            GeocodingService geocodingService,
            ImageService imageService) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
        this.clienteRepository = clienteRepository;
        this.almacenRepository = almacenRepository;
        this.direccionRepository = direccionRepository;
        this.regionRepository = regionRepository;
        this.comunaRepository = comunaRepository;
        this.estadoCuentaRepository = estadoCuentaRepository;
        this.configuracionUsuarioRepository = configuracionUsuarioRepository;
        this.tipoContactoRepository = tipoContactoRepository;
        this.almacenContactoRepository = almacenContactoRepository;
        this.rutValidator = rutValidator;
        this.geocodingService = geocodingService;
        this.imageService = imageService;
    }

    @Transactional
    public UsuarioResponse createUsuario(UsuarioRequest request) {
        validateRequest(request);

        Rol rol = findRol(request.getTipoCuenta().name());
        EstadoCuenta estadoCuenta = findEstadoCuenta(estadoCuentaInicial(request.getTipoCuenta()));

        Usuario usuario = new Usuario();
        usuario.setRut(rutValidator.normalize(request.getRut()));
        usuario.setNombreUsuario(request.getNombreUsuario());
        usuario.setNombre(request.getNombre());
        usuario.setCorreo(request.getCorreo());
        usuario.setContrasena(passwordEncoder.encode(request.getContrasena()));
        usuario.setRol(rol);
        Usuario saved = usuarioRepository.save(usuario);

        Direccion direccion = createDireccion(request.getDireccion());
        if (request.getTipoCuenta() == UsuarioRequest.TipoCuenta.CLIENTE) {
            Cliente cliente = new Cliente();
            cliente.setUsuario(saved);
            cliente.setDireccion(direccion);
            cliente.setEstadoCuenta(estadoCuenta);
            cliente.setFechaNacimiento(request.getFechaNacimiento());
            clienteRepository.save(cliente);
        } else {
            Almacen almacen = new Almacen();
            almacen.setNombre(request.getNombreAlmacen());
            almacen.setDueno(saved);
            almacen.setDireccion(direccion);
            almacen.setEstadoCuenta(estadoCuenta);
            Almacen savedAlmacen = almacenRepository.save(almacen);
            createTelefonoPrincipal(savedAlmacen, request.getTelefono());
        }

        ConfiguracionUsuario configuracion = new ConfiguracionUsuario();
        configuracion.setUsuario(saved);
        configuracionUsuarioRepository.save(configuracion);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse getUsuarioById(String id) {
        return toResponse(findUsuarioById(id));
    }

    @Transactional(readOnly = true)
    public UsuarioProfileResponse getUsuarioProfileById(String id) {
        Usuario usuario = findUsuarioById(id);

        ClienteProfileResponse clienteProfile = clienteRepository.findByUsuarioIdUsuario(usuario.getIdUsuario())
                .map(this::mapCliente)
                .orElse(null);

        List<AlmacenProfileResponse> almacenes = almacenRepository
                .findByDuenoIdUsuarioOrderByIdAlmacenDesc(usuario.getIdUsuario()).stream()
                .map(this::mapAlmacen)
                .collect(Collectors.toList());

        return new UsuarioProfileResponse(
                usuario.getIdUsuario(),
                String.valueOf(usuario.getIdUsuario()),
                usuario.getRut(),
                usuario.getNombreUsuario(),
                usuario.getNombre(),
                usuario.getCorreo(),
                usuario.getRol().getNombreRol(),
                usuario.getFotoPerfil(),
                clienteProfile,
                almacenes);
    }

    @Transactional
    public String uploadProfilePhoto(String id, MultipartFile file) throws IOException {
        Usuario usuario = findUsuarioById(id);
        String imageUrl = imageService.uploadImage(file);
        usuario.setFotoPerfil(imageUrl);
        usuarioRepository.save(usuario);
        return imageUrl;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listUsuarios() {
        return usuarioRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UsuarioResponse getUsuarioByNombre(String nombreUsuario) {
        return usuarioRepository.findByNombreUsuario(nombreUsuario)
                .map(this::toResponse)
                .orElseThrow(() -> new UsuarioNotFoundException(nombreUsuario));
    }

    private void validateRequest(UsuarioRequest request) {
        String rut = rutValidator.normalize(request.getRut());

        if (!rutValidator.isValid(rut)) {
            throw new IllegalArgumentException("El RUT no tiene un formato válido");
        }

        if (usuarioRepository.existsByRut(rut)) {
            throw new IllegalArgumentException("El RUT ya está registrado");
        }

        if (usuarioRepository.existsByNombreUsuario(request.getNombreUsuario())) {
            throw new IllegalArgumentException("El nombre de usuario ya está registrado");
        }

        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }

        if (request.getTipoCuenta() == UsuarioRequest.TipoCuenta.CLIENTE && request.getFechaNacimiento() == null) {
            throw new IllegalArgumentException("La fecha de nacimiento es obligatoria para clientes");
        }

        if (request.getTipoCuenta() == UsuarioRequest.TipoCuenta.ALMACEN
                && (request.getNombreAlmacen() == null || request.getNombreAlmacen().isBlank())) {
            throw new IllegalArgumentException("El nombre del almacén es obligatorio");
        }

        if (request.getTipoCuenta() == UsuarioRequest.TipoCuenta.ALMACEN
                && (request.getTelefono() == null || request.getTelefono().isBlank())) {
            throw new IllegalArgumentException("El teléfono del almacén es obligatorio");
        }
    }

    private void createTelefonoPrincipal(Almacen almacen, String telefono) {
        TipoContacto tipoTelefono = tipoContactoRepository.findByCodigo("TELEFONO")
                .orElseGet(() -> tipoContactoRepository.save(new TipoContacto("TELEFONO", "Telefono")));
        AlmacenContacto contacto = new AlmacenContacto();
        contacto.setAlmacen(almacen);
        contacto.setTipoContacto(tipoTelefono);
        contacto.setValor(telefono);
        contacto.setNombreContacto(almacen.getNombre());
        contacto.setEsPrincipal(true);
        almacenContactoRepository.save(contacto);
    }

    public Direccion createDireccionForAlmacen(DireccionRequest request) {
        return createDireccion(request);
    }

    public Direccion updateDireccionForAlmacen(Direccion direccion, DireccionRequest request) {
        return saveDireccion(direccion, request);
    }

    private Direccion createDireccion(DireccionRequest request) {
        return saveDireccion(new Direccion(), request);
    }

    private Direccion saveDireccion(Direccion direccion, DireccionRequest request) {
        RegionInput regionInput = normalizeRegion(request.getRegion());
        String comunaNombre = normalizeComuna(request.getComuna());
        Region region = regionRepository.findByNombreIgnoreCaseOrCodigoIgnoreCase(
                regionInput.nombre(),
                regionInput.codigo())
                .orElseGet(() -> regionRepository.save(new Region(regionInput.nombre(), regionInput.codigo())));

        Comuna comuna = comunaRepository.findByNombreIgnoreCaseAndRegion(comunaNombre, region)
                .orElseGet(() -> comunaRepository.save(new Comuna(comunaNombre, region)));

        GeocodingService.Coordinates coordinates = geocodingService.geocode(request);

        direccion.setCalle(request.getCalle());
        direccion.setNumero(request.getNumero());
        direccion.setCodigoPostal(request.getCodigoPostal());
        direccion.setComuna(comuna);
        direccion.setLatitud(coordinates.latitud());
        direccion.setLongitud(coordinates.longitud());

        return direccionRepository.save(direccion);
    }

    private Rol findRol(String nombreRol) {
        return rolRepository.findByNombreRol(nombreRol)
                .orElseGet(() -> rolRepository.save(new Rol(nombreRol)));
    }

    private EstadoCuenta findEstadoCuenta(String codigo) {
        return estadoCuentaRepository.findByCodigo(codigo)
                .orElseGet(() -> estadoCuentaRepository.save(new EstadoCuenta(codigo, codigo, null)));
    }

    private String estadoCuentaInicial(UsuarioRequest.TipoCuenta tipoCuenta) {
        return tipoCuenta == UsuarioRequest.TipoCuenta.CLIENTE ? "ACTIVO" : "PENDIENTE";
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getIdUsuario(),
                String.valueOf(usuario.getIdUsuario()),
                usuario.getRut(),
                usuario.getNombreUsuario(),
                usuario.getNombre(),
                usuario.getCorreo(),
                usuario.getRol().getNombreRol(),
                usuario.getFotoPerfil());
    }

    private Usuario findUsuarioById(String id) {
        if (id == null || id.isBlank()) {
            throw new UsuarioNotFoundException("Identificador inválido");
        }

        try {
            return usuarioRepository.findById(Long.valueOf(id))
                    .orElseThrow(() -> new UsuarioNotFoundException(id));
        } catch (NumberFormatException e) {
            throw new UsuarioNotFoundException(id);
        }
    }

    private ClienteProfileResponse mapCliente(Cliente cliente) {
        return new ClienteProfileResponse(
                cliente.getIdCliente(),
                cliente.getFechaNacimiento(),
                mapEstadoCuenta(cliente.getEstadoCuenta()),
                mapDireccion(cliente.getDireccion()));
    }

    private AlmacenProfileResponse mapAlmacen(Almacen almacen) {
        return new AlmacenProfileResponse(
                almacen.getIdAlmacen(),
                almacen.getNombre(),
                mapEstadoCuenta(almacen.getEstadoCuenta()),
                mapDireccion(almacen.getDireccion()));
    }

    private EstadoCuentaResponse mapEstadoCuenta(EstadoCuenta estadoCuenta) {
        if (estadoCuenta == null) {
            return null;
        }

        return new EstadoCuentaResponse(estadoCuenta.getCodigo(), estadoCuenta.getNombre());
    }

    private DireccionResponse mapDireccion(Direccion direccion) {
        if (direccion == null) {
            return null;
        }

        return new DireccionResponse(
                direccion.getCalle(),
                direccion.getNumero(),
                direccion.getCodigoPostal(),
                direccion.getComuna().getNombre(),
                direccion.getComuna().getRegion().getNombre(),
                direccion.getLatitud(),
                direccion.getLongitud());
    }

    private RegionInput normalizeRegion(String region) {
        String cleaned = region == null ? "" : region.trim();
        String key = removeAccents(cleaned).toUpperCase();
        if (key.equals("RM")
                || key.equals("METROPOLITANA")
                || key.equals("REGION METROPOLITANA")
                || key.equals("METROPOLITANA DE SANTIAGO")
                || key.equals("REGION METROPOLITANA DE SANTIAGO")) {
            return new RegionInput("Metropolitana de Santiago", "RM");
        }
        return new RegionInput(cleaned, cleaned);
    }

    private String normalizeComuna(String comuna) {
        String cleaned = comuna == null ? "" : comuna.trim();
        String key = removeAccents(cleaned).toUpperCase();
        if (key.equals("PENALOLEN")) {
            return "Peñalolén";
        }
        return cleaned;
    }

    private String removeAccents(String value) {
        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
    }

    private record RegionInput(String nombre, String codigo) {
    }
}
