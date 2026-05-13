package com.alovecino.usuarioservice.service;

import org.springframework.stereotype.Component;

@Component
public class RutValidator {

    public boolean isValid(String rut) {
        if (rut == null) {
            return false;
        }
        String normalized = normalize(rut);
        if (!normalized.matches("\\d{7,8}[0-9K]")) {
            return false;
        }

        String body = normalized.substring(0, normalized.length() - 1);
        char verifier = normalized.charAt(normalized.length() - 1);
        int multiplier = 2;
        int sum = 0;
        for (int i = body.length() - 1; i >= 0; i--) {
            sum += Character.digit(body.charAt(i), 10) * multiplier;
            multiplier = multiplier == 7 ? 2 : multiplier + 1;
        }
        int value = 11 - (sum % 11);
        char expected = switch (value) {
            case 11 -> '0';
            case 10 -> 'K';
            default -> Character.forDigit(value, 10);
        };
        return verifier == expected;
    }

    public String normalize(String rut) {
        return rut == null ? null : rut.replace(".", "").replace("-", "").trim().toUpperCase();
    }
}
