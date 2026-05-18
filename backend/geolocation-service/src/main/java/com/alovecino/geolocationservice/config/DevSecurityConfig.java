package com.alovecino.geolocationservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuración de seguridad para desarrollo.
 * 
 * Permite acceso sin autenticación a todos los endpoints cuando el perfil es "dev".
 * Esto es útil para pruebas locales aisladas del microservicio.
 * 
 * Para desactivar en producción, no incluir este @Profile("dev") o eliminar esta clase.
 */
@Configuration
@EnableWebSecurity
@Profile("dev")
public class DevSecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .anyRequest()
                .permitAll()
            )
            .httpBasic(basic -> basic.disable())
            .formLogin(login -> login.disable());
        
        return http.build();
    }
}
