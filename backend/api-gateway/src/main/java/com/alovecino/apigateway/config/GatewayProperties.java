package com.alovecino.apigateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "gateway")
public class GatewayProperties {

    private final Services services = new Services();
    private final Security security = new Security();

    public Services getServices() {
        return services;
    }

    public Security getSecurity() {
        return security;
    }

    public static class Services {
        private final Service auth = new Service();
        private final Service usuarios = new Service();
        private final Service geolocation = new Service();

        public Service getAuth() {
            return auth;
        }

        public Service getUsuarios() {
            return usuarios;
        }

        public Service getGeolocation() {
            return geolocation;
        }
    }

    public static class Service {
        private String baseUrl;

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }
    }

    public static class Security {
        private final Jwt jwt = new Jwt();

        public Jwt getJwt() {
            return jwt;
        }
    }

    public static class Jwt {
        private String jwkSetUri;
        private String issuer;
        private String audience;

        public String getJwkSetUri() {
            return jwkSetUri;
        }

        public void setJwkSetUri(String jwkSetUri) {
            this.jwkSetUri = jwkSetUri;
        }

        public String getIssuer() {
            return issuer;
        }

        public void setIssuer(String issuer) {
            this.issuer = issuer;
        }

        public String getAudience() {
            return audience;
        }

        public void setAudience(String audience) {
            this.audience = audience;
        }
    }
}
