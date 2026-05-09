package com.alovecino.authservice.config;

import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
public class RsaKeyConfig {

    private static final Logger logger = LoggerFactory.getLogger(RsaKeyConfig.class);

    @Bean
    public RsaKeyPair rsaKeyPair(JwtProperties jwtProperties) {
        if (StringUtils.hasText(jwtProperties.getPrivateKey()) && StringUtils.hasText(jwtProperties.getPublicKey())) {
            return parseKeyPair(jwtProperties.getPrivateKey(), jwtProperties.getPublicKey());
        }

        logger.warn("No RSA keys configured for auth-service. Generating ephemeral development keys.");
        return generateKeyPair();
    }

    private RsaKeyPair parseKeyPair(String privateKey, String publicKey) {
        try {
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            byte[] privateBytes = decodePem(privateKey);
            byte[] publicBytes = decodePem(publicKey);
            RSAPrivateKey parsedPrivateKey = (RSAPrivateKey) keyFactory.generatePrivate(new PKCS8EncodedKeySpec(privateBytes));
            RSAPublicKey parsedPublicKey = (RSAPublicKey) keyFactory.generatePublic(new X509EncodedKeySpec(publicBytes));
            return new RsaKeyPair(parsedPrivateKey, parsedPublicKey);
        } catch (Exception ex) {
            throw new IllegalStateException("Invalid RSA key configuration", ex);
        }
    }

    private RsaKeyPair generateKeyPair() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            KeyPair keyPair = generator.generateKeyPair();
            return new RsaKeyPair((RSAPrivateKey) keyPair.getPrivate(), (RSAPublicKey) keyPair.getPublic());
        } catch (Exception ex) {
            throw new IllegalStateException("Could not generate RSA key pair", ex);
        }
    }

    private byte[] decodePem(String key) {
        String normalized = key
                .replace("\\n", "")
                .replace("\r", "")
                .replace("\n", "")
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s", "");
        return Base64.getDecoder().decode(normalized);
    }

    public record RsaKeyPair(RSAPrivateKey privateKey, RSAPublicKey publicKey) {
    }
}
