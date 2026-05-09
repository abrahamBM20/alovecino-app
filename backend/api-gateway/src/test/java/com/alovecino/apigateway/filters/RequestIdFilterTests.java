package com.alovecino.apigateway.filters;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

class RequestIdFilterTests {

    private static final String REQUEST_ID_HEADER = "X-Request-Id";

    private final RequestIdFilter filter = new RequestIdFilter();

    @Test
    void shouldKeepExistingRequestIdWithoutDuplicatingHeader() {
        String requestId = "client-request-id";
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/usuarios/me")
                        .header(REQUEST_ID_HEADER, requestId)
                        .build());
        AtomicReference<ServerWebExchange> filteredExchange = new AtomicReference<>();

        filter.filter(exchange, captureExchange(filteredExchange)).block();

        ServerHttpRequest request = filteredExchange.get().getRequest();
        assertThat(request.getHeaders().get(REQUEST_ID_HEADER)).containsExactly(requestId);
        assertThat(filteredExchange.get().getResponse().getHeaders().getFirst(REQUEST_ID_HEADER))
                .isEqualTo(requestId);
    }

    @Test
    void shouldGenerateRequestIdWhenHeaderIsMissing() {
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/actuator/health").build());
        AtomicReference<ServerWebExchange> filteredExchange = new AtomicReference<>();

        filter.filter(exchange, captureExchange(filteredExchange)).block();

        String requestId = filteredExchange.get().getRequest().getHeaders().getFirst(REQUEST_ID_HEADER);
        assertThat(requestId).isNotBlank();
        assertThat(UUID.fromString(requestId).toString()).isEqualTo(requestId);
        assertThat(filteredExchange.get().getResponse().getHeaders().getFirst(REQUEST_ID_HEADER))
                .isEqualTo(requestId);
    }

    @Test
    void shouldRunBeforeOtherGatewayFilters() {
        assertThat(filter.getOrder()).isEqualTo(Integer.MIN_VALUE);
    }

    private GatewayFilterChain captureExchange(AtomicReference<ServerWebExchange> filteredExchange) {
        return exchange -> {
            filteredExchange.set(exchange);
            return Mono.empty();
        };
    }
}
