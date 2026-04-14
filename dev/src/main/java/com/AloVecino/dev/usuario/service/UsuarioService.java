package com.AloVecino.dev.usuario.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.AloVecino.dev.usuario.dto.UsuarioRequest;
import com.AloVecino.dev.usuario.dto.UsuarioResponse;
import com.AloVecino.dev.usuario.exception.UsuarioNotFoundException;
import com.AloVecino.dev.usuario.model.Rol;
import com.AloVecino.dev.usuario.model.Usuario;
import com.AloVecino.dev.usuario.repository.RolRepository;
import com.AloVecino.dev.usuario.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, RolRepository rolRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UsuarioResponse createUsuario(UsuarioRequest request) {
        Rol rol = rolRepository.findByNombreRol(request.getNombreRol())
                .orElseGet(() -> rolRepository.save(new Rol(request.getNombreRol())));
        Usuario usuario = new Usuario();
        usuario.setNombreUsuario(request.getNombreUsuario());
        usuario.setContrasena(passwordEncoder.encode(request.getContrasena()));
        usuario.setRol(rol);
        Usuario saved = usuarioRepository.save(usuario);
        return toResponse(saved);
    }

    public UsuarioResponse getUsuarioById(Long idUsuario) {
        return usuarioRepository.findById(idUsuario)
                .map(this::toResponse)
                .orElseThrow(() -> new UsuarioNotFoundException(idUsuario));
    }

    public List<UsuarioResponse> listUsuarios() {
        return usuarioRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public UsuarioResponse getUsuarioByNombre(String nombreUsuario) {
        return usuarioRepository.findByNombreUsuario(nombreUsuario)
                .map(this::toResponse)
                .orElseThrow(() -> new UsuarioNotFoundException(nombreUsuario));
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        return new UsuarioResponse(usuario.getIdUsuario(), usuario.getNombreUsuario(), usuario.getRol().getNombreRol());
    }
}
