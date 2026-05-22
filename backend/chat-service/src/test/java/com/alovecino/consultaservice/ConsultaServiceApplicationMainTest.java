package com.alovecino.consultaservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

import static org.assertj.core.api.Assertions.assertThat;

class ConsultaServiceApplicationMainTest {

    @Test
    void mainApplication_debeEstarMarcadaComoSpringBootApplication() {
        assertThat(ConsultaServiceApplication.class.isAnnotationPresent(SpringBootApplication.class)).isTrue();
    }

    @Test
    void mainApplication_debeMantenerEnableAsync() {
        assertThat(ConsultaServiceApplication.class.isAnnotationPresent(EnableAsync.class)).isTrue();
    }
}
