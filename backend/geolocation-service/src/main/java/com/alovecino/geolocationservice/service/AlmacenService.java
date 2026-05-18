package com.alovecino.geolocationservice.service;

import java.math.BigDecimal;
import java.util.Locale;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alovecino.geolocationservice.dto.AlmacenResponse;
import com.alovecino.geolocationservice.dto.CrearAlmacenRequest;
import com.alovecino.geolocationservice.model.Almacen;
import com.alovecino.geolocationservice.model.Comuna;
import com.alovecino.geolocationservice.model.Direccion;
import com.alovecino.geolocationservice.model.EstadoCuenta;
import com.alovecino.geolocationservice.model.Region;
import com.alovecino.geolocationservice.model.Usuario;
import com.alovecino.geolocationservice.repository.AlmacenRepository;
import com.alovecino.geolocationservice.repository.ComunaRepository;
import com.alovecino.geolocationservice.repository.DireccionRepository;
import com.alovecino.geolocationservice.repository.EstadoCuentaRepository;
import com.alovecino.geolocationservice.repository.RegionRepository;
import com.alovecino.geolocationservice.repository.UsuarioRepository;

@Service
public class AlmacenService {

    private static final String ESTADO_ACTIVO = "ACTIVO";

    private final AlmacenRepository almacenRepository;
    private final RegionRepository regionRepository;
    private final ComunaRepository comunaRepository;
    private final DireccionRepository direccionRepository;
    private final EstadoCuentaRepository estadoCuentaRepository;
    private final UsuarioRepository usuarioRepository;
    private final GeolocationService geolocationService;

    public AlmacenService(AlmacenRepository almacenRepository, RegionRepository regionRepository,
            ComunaRepository comunaRepository, DireccionRepository direccionRepository,
            EstadoCuentaRepository estadoCuentaRepository, UsuarioRepository usuarioRepository,
            GeolocationService geolocationService) {
        this.almacenRepository = almacenRepository;
        this.regionRepository = regionRepository;
        this.comunaRepository = comunaRepository;
        this.direccionRepository = direccionRepository;
        this.estadoCuentaRepository = estadoCuentaRepository;
        this.usuarioRepository = usuarioRepository;
        this.geolocationService = geolocationService;
    }

    @Transactional
    public AlmacenResponse crearAlmacen(CrearAlmacenRequest request) {
        var direccionRequest = request.getDireccion();
        var region = findOrCreateRegion(direccionRequest.getRegion());
        var comuna = findOrCreateComuna(direccionRequest.getComuna(), region);
        var direccion = findOrCreateDireccion(direccionRequest, comuna);
        var estadoCuenta = findOrCreateEstadoCuenta(ESTADO_ACTIVO);
        var usuario = findUsuario(request.getUsuarioId());

        var almacen = almacenRepository.findByUsuarioAndNombreIgnoreCaseAndDireccion(usuario, request.getNombre(),
                direccion).orElseGet(() -> {
                    var newAlmacen = new Almacen();
                    newAlmacen.setNombre(request.getNombre().trim());
                    newAlmacen.setUsuario(usuario);
                    newAlmacen.setDireccion(direccion);
                    newAlmacen.setEstadoCuenta(estadoCuenta);
                    return almacenRepository.save(newAlmacen);
                });

        return AlmacenResponse.fromEntity(almacen);
    }

    private Region findOrCreateRegion(String regionName) {
        var normalized = regionName.trim();
        return regionRepository.findByNombreIgnoreCase(normalized).orElseGet(() -> {
            var region = new Region();
            region.setNombre(normalized);
            region.setCodigo(generateRegionCode(normalized));
            return regionRepository.save(region);
        });
    }

    private String generateRegionCode(String regionName) {
        var code = regionName.toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9]+", "_");
        if (code.length() > 20) {
            code = code.substring(0, 20);
        }
        return code;
    }

    private Comuna findOrCreateComuna(String comunaName, Region region) {
        var normalized = comunaName.trim();
        return comunaRepository.findByNombreIgnoreCaseAndRegion(normalized, region).orElseGet(() -> {
            var comuna = new Comuna();
            comuna.setNombre(normalized);
            comuna.setRegion(region);
            return comunaRepository.save(comuna);
        });
    }

    private Direccion findOrCreateDireccion(com.alovecino.geolocationservice.dto.DireccionRequest direccionRequest,
            Comuna comuna) {
        var calle = direccionRequest.getCalle().trim();
        var numero = direccionRequest.getNumero().trim();
        return direccionRepository.findByCalleIgnoreCaseAndNumeroIgnoreCaseAndComuna(calle, numero, comuna)
                .orElseGet(() -> {
                    var coords = geolocationService.geocode(direccionRequest);
                    var direccion = new Direccion();
                    direccion.setCalle(calle);
                    direccion.setNumero(numero);
                    direccion.setCodigoPostal(direccionRequest.getCodigoPostal());
                    direccion.setLatitud(coords.latitud());
                    direccion.setLongitud(coords.longitud());
                    direccion.setComuna(comuna);
                    return direccionRepository.save(direccion);
                });
    }

    private EstadoCuenta findOrCreateEstadoCuenta(String codigo) {
        return estadoCuentaRepository.findByCodigoIgnoreCase(codigo).orElseGet(() -> {
            var estadoCuenta = new EstadoCuenta();
            estadoCuenta.setCodigo(codigo);
            return estadoCuentaRepository.save(estadoCuenta);
        });
    }

    private Usuario findUsuario(Long usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario con id " + usuarioId + " no existe."));
    }
}
