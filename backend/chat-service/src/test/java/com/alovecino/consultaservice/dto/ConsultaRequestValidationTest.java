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

class ConsultaRequestValidationTest {

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
    void consultaRequest_valido_noDebeTenerErroresDeValidacion() {
        ConsultaRequest request = requestValido();

        Set<ConstraintViolation<ConsultaRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }

    @Test
    void descripcionVacia_debeSerInvalida() {
        ConsultaRequest request = requestValido();
        request.setDescripcion("   ");

        Set<ConstraintViolation<ConsultaRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("descripcion");
    }

    @Test
    void descripcionMayorA1000Caracteres_debeSerInvalida() {
        ConsultaRequest request = requestValido();
        request.setDescripcion("a".repeat(1001));

        Set<ConstraintViolation<ConsultaRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("descripcion");
    }

    @Test
    void camposObligatoriosNulos_debenSerInvalidos() {
        ConsultaRequest request = new ConsultaRequest();

        Set<ConstraintViolation<ConsultaRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("descripcion", "cantidad", "idCliente", "idAlmacen")
                .doesNotContain("idEstadoConsulta");
    }

    @Test
    void cantidadNegativa_debeSerInvalida() {
        ConsultaRequest request = requestValido();
        request.setCantidad(-1);

        Set<ConstraintViolation<ConsultaRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("cantidad");
    }

    @Test
    void idsCeroONegativos_debenSerInvalidos() {
        ConsultaRequest request = requestValido();
        request.setIdCliente(0L);
        request.setIdAlmacen(-2L);

        Set<ConstraintViolation<ConsultaRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("idCliente", "idAlmacen");
    }

    private ConsultaRequest requestValido() {
        ConsultaRequest request = new ConsultaRequest();
        request.setDescripcion("Necesito consultar stock disponible");
        request.setCantidad(3);
        request.setIdCliente(1L);
        request.setIdAlmacen(2L);
        return request;
    }
}
