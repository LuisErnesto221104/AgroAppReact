package com.example.agroappreact.dao;

public class Usuario {
    
    // Enumeración para tipos de usuario
    public enum TipoUsuario {
        ADMIN,
        USUARIO
    }
    
    private int id;
    private String username;
    private String password;
    private String nombre;
    private TipoUsuario rol;
    
    public Usuario() {
        this.rol = TipoUsuario.USUARIO; // Por defecto es usuario normal
    }
    
    public Usuario(int id, String username, String password, String nombre) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.nombre = nombre;
        this.rol = TipoUsuario.USUARIO;
    }
    
    public Usuario(int id, String username, String password, String nombre, TipoUsuario rol) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.nombre = nombre;
        this.rol = rol;
    }
    
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getNombre() {
        return nombre;
    }
    
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    
    public TipoUsuario getRol() {
        return rol;
    }
    
    public void setRol(TipoUsuario rol) {
        this.rol = rol;
    }
    
    public boolean esAdmin() {
        return this.rol == TipoUsuario.ADMIN;
    }
}
