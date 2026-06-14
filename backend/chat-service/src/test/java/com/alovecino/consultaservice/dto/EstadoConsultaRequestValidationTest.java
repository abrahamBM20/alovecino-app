package com.alovecino.consultaservice.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class EstadoConsultaRequestValidationTest {

    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void closeValidator() {
        validatorFactory.close();
    }

    @Test
    void estadoConsultaRequest_valido_noDebeTenerErroresDeValidacion() {
        EstadoConsultaRequest request = requestValido();

        Set<ConstraintViolation<EstadoConsultaRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }

    @Test
    void nombreVacio_debeSerInvalido() {
        EstadoConsultaRequest request = requestValido();
        request.setNombre("   ");

        Set<ConstraintViolation<EstadoConsultaRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("nombre");
    }

    @Test
    void nombreMayorA50Caracteres_debeSerInvalido() {
        EstadoConsultaRequest request = requestValido();
        request.setNombre("a".repeat(51));

        Set<ConstraintViolation<EstadoConsultaRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("nombre");
    }

    @Test
    void descripcionMayorA500Caracteres_debeSerInvalida() {
        EstadoConsultaRequest request = requestValido();
        request.setDescripcion("a".repeat(501));

        Set<ConstraintViolation<EstadoConsultaRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("descripcion");
    }

    private EstadoConsultaRequest requestValido() {
        EstadoConsultaRequest request = new EstadoConsultaRequest();
        request.setNombre("PENDIENTE");
        request.setDescripcion("Consulta pendiente de respuesta");
        return request;
    }
}
