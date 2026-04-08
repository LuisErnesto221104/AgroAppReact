package com.agroappreact.models;

public class Alimentacion {
    private int id;
    private int animalId;
    private String tipoAlimento;
    private double cantidad;
    private String unidad;
    private String fecha;
    private String observaciones;
    private double costo;
    
    public Alimentacion() {}
    
    public Alimentacion(int id, int animalId, String tipoAlimento, double cantidad,
                       String unidad, String fecha, double costo, String observaciones) {
        this.id = id;
        this.animalId = animalId;
        this.tipoAlimento = tipoAlimento;
        this.cantidad = cantidad;
        this.unidad = unidad;
        this.fecha = fecha;
        this.costo = costo;
        this.observaciones = observaciones;
    }
    
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public int getAnimalId() {
        return animalId;
    }
    
    public void setAnimalId(int animalId) {
        this.animalId = animalId;
    }
    
    public String getTipoAlimento() {
        return tipoAlimento;
    }
    
    public void setTipoAlimento(String tipoAlimento) {
        this.tipoAlimento = tipoAlimento;
    }
    
    public double getCantidad() {
        return cantidad;
    }
    
    public void setCantidad(double cantidad) {
        this.cantidad = cantidad;
    }
    
    public String getUnidad() {
        return unidad;
    }
    
    public void setUnidad(String unidad) {
        this.unidad = unidad;
    }
    
    public String getFecha() {
        return fecha;
    }
    
    public void setFecha(String fecha) {
        this.fecha = fecha;
    }
    
    public String getObservaciones() {
        return observaciones;
    }
    
    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
    
    public double getCosto() {
        return costo;
    }
    
    public void setCosto(double costo) {
        this.costo = costo;
    }
}
