package com.agroappreact.models;

public class Animal {

    
    private int id;
    private String numeroArete;
    private String nombre;
    private String raza;
    private String sexo;
    private String fechaNacimiento;
    private String fechaIngreso;
    private String fechaSalida;
    private double precioCompra;
    private double precioVenta;
    private String foto;
    private String estado;
    private String observaciones;
    private double pesoNacer;
    private double pesoActual;
    
    public Animal() {}
    
    public Animal(int id, String numeroArete, String nombre, String raza, String sexo,
                  String fechaNacimiento, String fechaIngreso, String fechaSalida,
                  double precioCompra, double precioVenta, String foto, String estado,
                  String observaciones) {
        this.id = id;
        this.numeroArete = numeroArete;
        this.nombre = nombre;
        this.raza = raza;
        this.sexo = sexo;
        this.fechaNacimiento = fechaNacimiento;
        this.fechaIngreso = fechaIngreso;
        this.fechaSalida = fechaSalida;
        this.precioCompra = precioCompra;
        this.precioVenta = precioVenta;
        this.foto = foto;
        this.estado = estado;
        this.observaciones = observaciones;
    }
    
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public String getNumeroArete() {
        return numeroArete;
    }
    
    public void setNumeroArete(String numeroArete) {
        this.numeroArete = numeroArete;
    }
    
    public String getNombre() {
        return nombre;
    }
    
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    
    public String getRaza() {
        return raza;
    }
    
    public void setRaza(String raza) {
        this.raza = raza;
    }
    
    public String getSexo() {
        return sexo;
    }
    
    public void setSexo(String sexo) {
        this.sexo = sexo;
    }
    
    public String getFechaNacimiento() {
        return fechaNacimiento;
    }
    
    public void setFechaNacimiento(String fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
    }
    
    public String getFechaIngreso() {
        return fechaIngreso;
    }
    
    public void setFechaIngreso(String fechaIngreso) {
        this.fechaIngreso = fechaIngreso;
    }
    
    public String getFechaSalida() {
        return fechaSalida;
    }
    
    public void setFechaSalida(String fechaSalida) {
        this.fechaSalida = fechaSalida;
    }
    
    public double getPrecioCompra() {
        return precioCompra;
    }
    
    public void setPrecioCompra(double precioCompra) {
        this.precioCompra = precioCompra;
    }
    
    public double getPrecioVenta() {
        return precioVenta;
    }
    
    public void setPrecioVenta(double precioVenta) {
        this.precioVenta = precioVenta;
    }
    
    public String getFoto() {
        return foto;
    }
    
    public void setFoto(String foto) {
        this.foto = foto;
    }
    
    public String getEstado() {
        return estado;
    }
    
    public void setEstado(String estado) {
        this.estado = estado;
    }
    
    public String getObservaciones() {
        return observaciones;
    }
    
    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
    
    public double getPesoNacer() {
        return pesoNacer;
    }
    
    public void setPesoNacer(double pesoNacer) {
        this.pesoNacer = pesoNacer;
    }
    
    public double getPesoActual() {
        return pesoActual;
    }
    
    public void setPesoActual(double pesoActual) {
        this.pesoActual = pesoActual;
    }
}
