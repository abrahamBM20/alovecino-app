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

class ResponderConsultaRequestValidationTest {

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
    void responderConsultaRequest_valido_noDebeTenerErrores() {
        ResponderConsultaRequest request = requestValido();

        Set<ConstraintViolation<ResponderConsultaRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }

    @Test
    void respuestaVacia_debeSerInvalida() {
        ResponderConsultaRequest request = requestValido();
        request.setRespuesta("   ");

        Set<ConstraintViolation<ResponderConsultaRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("respuesta");
    }

    @Test
    void estadoNulo_debeSerValidoPorqueBackendUsaRespondidaPorDefecto() {
        ResponderConsultaRequest request = requestValido();
        request.setIdEstadoConsulta(null);

        Set<ConstraintViolation<ResponderConsultaRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }

    @Test
    void estadoCero_debeSerInvalido() {
        ResponderConsultaRequest request = requestValido();
        request.setIdEstadoConsulta(0L);

        Set<ConstraintViolation<ResponderConsultaRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("idEstadoConsulta");
    }

    private ResponderConsultaRequest requestValido() {
        ResponderConsultaRequest request = new ResponderConsultaRequest();
        request.setRespuesta("Sí, tenemos stock disponible");
        request.setIdEstadoConsulta(2L);
        return request;
    }
}
