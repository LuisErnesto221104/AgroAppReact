package com.agroappreact.models;

public class HistorialClinico {
    private int id;
    private int animalId;
    private String fecha;
    private String enfermedad;
    private String sintomas;
    private String tratamiento;
    private String estado;
    private String observaciones;
    
    public HistorialClinico() {}
    
    public HistorialClinico(int id, int animalId, String fecha, String enfermedad,
                           String sintomas, String tratamiento, String estado, String observaciones) {
        this.id = id;
        this.animalId = animalId;
        this.fecha = fecha;
        this.enfermedad = enfermedad;
        this.sintomas = sintomas;
        this.tratamiento = tratamiento;
        this.estado = estado;
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
    
    public String getFecha() {
        return fecha;
    }
    
    public void setFecha(String fecha) {
        this.fecha = fecha;
    }
    
    public String getEnfermedad() {
        return enfermedad;
    }
    
    public void setEnfermedad(String enfermedad) {
        this.enfermedad = enfermedad;
    }
    
    public String getSintomas() {
        return sintomas;
    }
    
    public void setSintomas(String sintomas) {
        this.sintomas = sintomas;
    }
    
    public String getTratamiento() {
        return tratamiento;
    }
    
    public void setTratamiento(String tratamiento) {
        this.tratamiento = tratamiento;
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
}
