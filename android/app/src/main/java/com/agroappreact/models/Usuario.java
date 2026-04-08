package com.agroappreact.models;

public class Usuario {
    
    // Enumeración para tipos de usuario
    public enum TipoUsuario {
        ADMIN,
        USUARIO
    }
    
    private int id;
    private String nombre;
    private String pin;
    private TipoUsuario rol;
    
    public Usuario() {
        this.rol = TipoUsuario.USUARIO; // Por defecto es usuario normal
    }
    
    public Usuario(int id, String nombre) {
        this.id = id;
        this.nombre = nombre;
        this.pin = "";
        this.rol = TipoUsuario.USUARIO;
    }
    
    public Usuario(int id, String nombre, TipoUsuario rol) {
        this.id = id;
        this.nombre = nombre;
        this.pin = "";
        this.rol = rol;
    }

    public Usuario(int id, String nombre, String pin, TipoUsuario rol) {
        this.id = id;
        this.nombre = nombre;
        this.pin = pin;
        this.rol = rol;
    }
    
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public String getNombre() {
        return nombre;
    }
    
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getPin() {
        return pin;
    }

    public void setPin(String pin) {
        this.pin = pin;
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
