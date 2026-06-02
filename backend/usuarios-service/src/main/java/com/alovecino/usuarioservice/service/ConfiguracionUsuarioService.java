package com.alovecino.usuarioservice.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alovecino.usuarioservice.dto.ConfiguracionUsuarioRequest;
import com.alovecino.usuarioservice.dto.ConfiguracionUsuarioResponse;
import com.alovecino.usuarioservice.exception.UsuarioNotFoundException;
import com.alovecino.usuarioservice.model.ConfiguracionUsuario;
import com.alovecino.usuarioservice.model.Usuario;
import com.alovecino.usuarioservice.repository.ConfiguracionUsuarioRepository;
import com.alovecino.usuarioservice.repository.UsuarioRepository;

@Service
public class ConfiguracionUsuarioService {

    private final ConfiguracionUsuarioRepository configuracionUsuarioRepository;
    private final UsuarioRepository usuarioRepository;

    public ConfiguracionUsuarioService(ConfiguracionUsuarioRepository configuracionUsuarioRepository,
            UsuarioRepository usuarioRepository) {
        this.configuracionUsuarioRepository = configuracionUsuarioRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public ConfiguracionUsuarioResponse getConfiguracion(Long idUsuario, String authenticatedUserId) {
        assertOwnConfiguration(idUsuario, authenticatedUserId);
        ConfiguracionUsuario configuracion = configuracionUsuarioRepository.findByUsuarioIdUsuario(idUsuario)
                .orElseGet(() -> createDefaultConfiguration(idUsuario));
        return ConfiguracionUsuarioResponse.fromEntity(configuracion);
    }

    @Transactional
    public ConfiguracionUsuarioResponse updateConfiguracion(Long idUsuario, String authenticatedUserId,
            ConfiguracionUsuarioRequest request) {
        assertOwnConfiguration(idUsuario, authenticatedUserId);

        ConfiguracionUsuario configuracion = configuracionUsuarioRepository.findByUsuarioIdUsuario(idUsuario)
                .orElseGet(() -> createDefaultConfiguration(idUsuario));

        configuracion.setNotificacionesPush(request.getNotificacionesPush());
        configuracion.setNotificacionesEmail(request.getNotificacionesEmail());
        configuracion.setRecibirOfertas(request.getRecibirOfertas());
        configuracion.setPerfilVisible(request.getPerfilVisible());
        configuracion.setRadioOfertasKm(request.getRadioOfertasKm());

        return ConfiguracionUsuarioResponse.fromEntity(configuracionUsuarioRepository.save(configuracion));
    }

    private ConfiguracionUsuario createDefaultConfiguration(Long idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new UsuarioNotFoundException(idUsuario));

        ConfiguracionUsuario configuracion = new ConfiguracionUsuario();
        configuracion.setUsuario(usuario);
        return configuracionUsuarioRepository.save(configuracion);
    }

    private void assertOwnConfiguration(Long idUsuario, String authenticatedUserId) {
        Long parsedAuthenticatedUserId;
        try {
            parsedAuthenticatedUserId = Long.valueOf(authenticatedUserId);
        } catch (NumberFormatException ex) {
            throw new AccessDeniedException("Token de usuario inválido");
        }

        if (!idUsuario.equals(parsedAuthenticatedUserId)) {
            throw new AccessDeniedException("No puedes modificar la configuración de otro usuario");
        }
    }
}
