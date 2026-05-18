package com.alovecino.geolocationservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración de CORS para permitir que el frontend (celular, emulador, navegador)
 * pueda hacer peticiones HTTP desde cualquier origen.
 * 
 * En producción, esto debe ser más restrictivo y especificar dominios permitidos.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("*")  // En desarrollo permite todos los orígenes
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD")
            .allowedHeaders("*")
            .maxAge(3600)
            .allowCredentials(false);  // No permitir credenciales con orígenes wildcard
    }
}
