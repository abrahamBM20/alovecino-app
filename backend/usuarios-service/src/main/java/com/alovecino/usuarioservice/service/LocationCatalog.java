package com.alovecino.usuarioservice.service;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

final class LocationCatalog {

    static final RegionInput REGION_METROPOLITANA = new RegionInput("Metropolitana de Santiago", "RM");

    static final List<String> COMUNAS_REGION_METROPOLITANA = List.of(
            "Alhué",
            "Buin",
            "Calera de Tango",
            "Cerrillos",
            "Cerro Navia",
            "Colina",
            "Conchalí",
            "Curacaví",
            "El Bosque",
            "El Monte",
            "Estación Central",
            "Huechuraba",
            "Independencia",
            "Isla de Maipo",
            "La Cisterna",
            "La Florida",
            "La Granja",
            "La Pintana",
            "La Reina",
            "Lampa",
            "Las Condes",
            "Lo Barnechea",
            "Lo Espejo",
            "Lo Prado",
            "Macul",
            "Maipú",
            "María Pinto",
            "Melipilla",
            "Ñuñoa",
            "Padre Hurtado",
            "Paine",
            "Pedro Aguirre Cerda",
            "Peñaflor",
            "Peñalolén",
            "Pirque",
            "Providencia",
            "Pudahuel",
            "Puente Alto",
            "Quilicura",
            "Quinta Normal",
            "Recoleta",
            "Renca",
            "San Bernardo",
            "San Joaquín",
            "San José de Maipo",
            "San Miguel",
            "San Pedro",
            "San Ramón",
            "Santiago",
            "Talagante",
            "Tiltil",
            "Vitacura");

    private static final Map<String, String> COMUNAS_BY_KEY = COMUNAS_REGION_METROPOLITANA.stream()
            .collect(Collectors.toUnmodifiableMap(LocationCatalog::key, Function.identity()));

    private LocationCatalog() {
    }

    static Optional<RegionInput> resolveRegion(String region) {
        String key = key(region);
        if (key.equals("RM")
                || key.equals("METROPOLITANA")
                || key.equals("REGION METROPOLITANA")
                || key.equals("METROPOLITANA DE SANTIAGO")
                || key.equals("REGION METROPOLITANA DE SANTIAGO")) {
            return Optional.of(REGION_METROPOLITANA);
        }
        return Optional.empty();
    }

    static Optional<String> resolveComuna(String comuna) {
        return Optional.ofNullable(COMUNAS_BY_KEY.get(key(comuna)));
    }

    private static String key(String value) {
        String cleaned = value == null ? "" : value.trim();
        return Normalizer.normalize(cleaned, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toUpperCase(Locale.ROOT);
    }

    record RegionInput(String nombre, String codigo) {
    }
}
