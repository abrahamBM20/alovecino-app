package com.alovecino.usuarioservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI usuarioServiceOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Alo Vecino - Usuarios Service API")
                        .description("Documentación de endpoints del microservicio de usuarios")
                        .version("v1")
                        .contact(new Contact().name("Equipo Alo Vecino")));
    }
}
