package com.alovecino.consultaservice.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.List;

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
    void detalleDescripcionVacia_debeSerInvalida() {
        ConsultaRequest request = requestValido();
        request.getDetalles().get(0).setDescripcion("   ");

        Set<ConstraintViolation<ConsultaRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("detalles[0].descripcion");
    }

    @Test
    void detalleDescripcionMayorA1000Caracteres_debeSerInvalida() {
        ConsultaRequest request = requestValido();
        request.getDetalles().get(0).setDescripcion("a".repeat(1001));

        Set<ConstraintViolation<ConsultaRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("detalles[0].descripcion");
    }

    @Test
    void camposObligatoriosNulos_debenSerInvalidos() {
        ConsultaRequest request = new ConsultaRequest();

        Set<ConstraintViolation<ConsultaRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("detalles", "idCliente", "idAlmacen")
                .doesNotContain("descripcion", "cantidad")
                .doesNotContain("idEstadoConsulta");
    }

    @Test
    void detalleNormalizadoInvalido_debeReportarCamposDelDetalle() {
        ConsultaRequest request = new ConsultaRequest();
        request.setIdCliente(1L);
        request.setIdAlmacen(2L);
        request.setDetalles(List.of(detalleValido(" ", 0)));

        Set<ConstraintViolation<ConsultaRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("detalles[0].descripcion", "detalles[0].cantidadSolicitada");
    }

    @Test
    void detalleCantidadNegativa_debeSerInvalida() {
        ConsultaRequest request = requestValido();
        request.getDetalles().get(0).setCantidadSolicitada(-1);

        Set<ConstraintViolation<ConsultaRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("detalles[0].cantidadSolicitada");
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
        request.setIdCliente(1L);
        request.setIdAlmacen(2L);
        request.setDetalles(List.of(detalleValido("Necesito consultar stock disponible", 3)));
        return request;
    }

    private ConsultaDetalleRequest detalleValido(String descripcion, Integer cantidadSolicitada) {
        ConsultaDetalleRequest detalle = new ConsultaDetalleRequest();
        detalle.setDescripcion(descripcion);
        detalle.setCantidadSolicitada(cantidadSolicitada);
        return detalle;
    }
}
