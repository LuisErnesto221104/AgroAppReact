package com.agroappreact.models;

public class Gasto {
    private int id;
    private int animalId;
    private String raza;
    private String tipo;
    private String concepto;
    private double monto;
    private String fecha;
    private String observaciones;
    
    public Gasto() {}
    
    public Gasto(int id, int animalId, String tipo, String concepto, double monto,
                String fecha, String observaciones) {
        this.id = id;
        this.animalId = animalId;
        this.tipo = tipo;
        this.concepto = concepto;
        this.monto = monto;
        this.fecha = fecha;
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
    
    public String getRaza() {
        return raza;
    }
    
    public void setRaza(String raza) {
        this.raza = raza;
    }
    
    public String getTipo() {
        return tipo;
    }
    
    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
    
    public String getConcepto() {
        return concepto;
    }
    
    public void setConcepto(String concepto) {
        this.concepto = concepto;
    }
    
    public double getMonto() {
        return monto;
    }
    
    public void setMonto(double monto) {
        this.monto = monto;
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
}
