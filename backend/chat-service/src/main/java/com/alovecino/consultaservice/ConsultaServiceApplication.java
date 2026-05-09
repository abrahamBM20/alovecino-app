package main.java.com.alovecino.consultaservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ConsultaServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ConsultaServiceApplication.class, args);
	}

}