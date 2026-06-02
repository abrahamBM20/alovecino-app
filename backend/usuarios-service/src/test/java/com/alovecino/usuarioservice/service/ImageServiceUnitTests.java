package com.alovecino.usuarioservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.Map;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

@ExtendWith(MockitoExtension.class)
class ImageServiceUnitTests {

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    private ImageService imageService;

    @BeforeEach
    void setUp() {
        imageService = new ImageService(cloudinary);
    }

    @Test
    void shouldUploadImageToCloudinaryAndReturnSecureUrl() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "perfil.png",
                "image/png",
                new byte[] { 1, 2, 3 });

        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap()))
                .thenReturn(Map.of("secure_url", "https://res.cloudinary.com/demo/image/upload/perfil.png"));

        String result = imageService.uploadImage(file);

        assertThat(result).isEqualTo("https://res.cloudinary.com/demo/image/upload/perfil.png");
    }

    @Test
    void shouldRejectEmptyFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "empty.png",
                "image/png",
                new byte[0]);

        assertThatThrownBy(() -> imageService.uploadImage(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("no puede estar vacío");
    }

    @Test
    void shouldRejectNonImageFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "documento.txt",
                "text/plain",
                "contenido".getBytes());

        assertThatThrownBy(() -> imageService.uploadImage(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Solo se permiten archivos de imagen");
    }

    @Test
    void shouldFailWhenCloudinaryDoesNotReturnSecureUrl() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "perfil.jpg",
                "image/jpeg",
                new byte[] { 4, 5, 6 });

        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(Map.of("public_id", "perfil"));

        assertThatThrownBy(() -> imageService.uploadImage(file))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("No se pudo obtener la URL de Cloudinary");
    }
}
