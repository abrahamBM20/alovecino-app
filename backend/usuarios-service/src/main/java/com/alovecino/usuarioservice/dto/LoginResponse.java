package com.alovecino.usuarioservice.dto;

public class LoginResponse {

    private String token;
    private SessionUserResponse user;

    public LoginResponse() {
    }

    public LoginResponse(String token, SessionUserResponse user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public SessionUserResponse getUser() {
        return user;
    }

    public void setUser(SessionUserResponse user) {
        this.user = user;
    }
}
