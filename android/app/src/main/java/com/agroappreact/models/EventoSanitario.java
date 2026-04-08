package com.agroappreact.models;

import java.util.Date;

public class EventoSanitario {
    private int id;
    private int animalId;
    private String raza;
    private String tipo;
    private String fechaProgramada;
    private String fechaRealizada;
    private String descripcion;
    private int recordatorio;
    private String estado;
    private Date fechaEvento; // Campo adicional para notificaciones
    private String horaRecordatorio; // Hora del recordatorio
    private double costo; // Costo del evento
    
    public EventoSanitario() {}
    
    public EventoSanitario(int id, int animalId, String tipo, String fechaProgramada,
                          String fechaRealizada, String descripcion, int recordatorio, String estado) {
        this.id = id;
        this.animalId = animalId;
        this.tipo = tipo;
        this.fechaProgramada = fechaProgramada;
        this.fechaRealizada = fechaRealizada;
        this.descripcion = descripcion;
        this.recordatorio = recordatorio;
        this.estado = estado;
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
    
    public String getFechaProgramada() {
        return fechaProgramada;
    }
    
    public void setFechaProgramada(String fechaProgramada) {
        this.fechaProgramada = fechaProgramada;
    }
    
    public String getFechaRealizada() {
        return fechaRealizada;
    }
    
    public void setFechaRealizada(String fechaRealizada) {
        this.fechaRealizada = fechaRealizada;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
    
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public int getRecordatorio() {
        return recordatorio;
    }
    
    public void setRecordatorio(int recordatorio) {
        this.recordatorio = recordatorio;
    }
    
    public String getEstado() {
        return estado;
    }
    
    public void setEstado(String estado) {
        this.estado = estado;
    }
    
    public Date getFechaEvento() {
        return fechaEvento;
    }
    
    public void setFechaEvento(Date fechaEvento) {
        this.fechaEvento = fechaEvento;
    }
    
    public String getHoraRecordatorio() {
        return horaRecordatorio;
    }
    
    public void setHoraRecordatorio(String horaRecordatorio) {
        this.horaRecordatorio = horaRecordatorio;
    }
    
    public double getCosto() {
        return costo;
    }
    
    public void setCosto(double costo) {
        this.costo = costo;
    }
    
    public boolean isRecordatorio() {
        return recordatorio == 1;
    }
}
