package com.alovecino.usuarioservice.exception;

public class UsuarioNotFoundException extends RuntimeException {

    public UsuarioNotFoundException(Long idUsuario) {
        super("Usuario no encontrado con id: " + idUsuario);
    }

    public UsuarioNotFoundException(String nombreUsuario) {
        super("Usuario no encontrado con nombre de usuario: " + nombreUsuario);
    }
}
