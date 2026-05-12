package com.agroappreact.models;

public class EventoSanitario {
    private int id;
    private int animalId;
    private String tipoEvento;
    private String descripcion;
    private String fechaEvento;
    private String veterinario;
    private String dosis;
    private String observaciones;
    private String fechaProximoEvento;

    private String raza;
    private String tipo;
    private String fechaProgramada;
    private String fechaRealizada;
    private int recordatorio;
    private String estado;
    private String horaRecordatorio;
    private double costo;

    public EventoSanitario() {
    }

    public EventoSanitario(int id, int animalId, String tipoEvento, String descripcion,
                           String fechaEvento, String veterinario, String dosis,
                           String observaciones, String fechaProximoEvento) {
        this.id = id;
        this.animalId = animalId;
        this.tipoEvento = tipoEvento;
        this.tipo = tipoEvento;
        this.descripcion = descripcion;
        this.fechaEvento = fechaEvento;
        this.fechaProgramada = fechaEvento;
        this.veterinario = veterinario;
        this.dosis = dosis;
        this.observaciones = observaciones;
        this.fechaProximoEvento = fechaProximoEvento;
    }

    public EventoSanitario(int id, int animalId, String tipo, String fechaProgramada,
                           String fechaRealizada, String descripcion, int recordatorio, String estado) {
        this.id = id;
        this.animalId = animalId;
        this.tipoEvento = tipo;
        this.tipo = tipo;
        this.fechaEvento = fechaProgramada;
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

    public String getTipoEvento() {
        return tipoEvento;
    }

    public void setTipoEvento(String tipoEvento) {
        this.tipoEvento = tipoEvento;
        this.tipo = tipoEvento;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getFechaEvento() {
        return fechaEvento;
    }

    public void setFechaEvento(String fechaEvento) {
        this.fechaEvento = fechaEvento;
        this.fechaProgramada = fechaEvento;
    }

    public String getVeterinario() {
        return veterinario;
    }

    public void setVeterinario(String veterinario) {
        this.veterinario = veterinario;
    }

    public String getDosis() {
        return dosis;
    }

    public void setDosis(String dosis) {
        this.dosis = dosis;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public String getFechaProximoEvento() {
        return fechaProximoEvento;
    }

    public void setFechaProximoEvento(String fechaProximoEvento) {
        this.fechaProximoEvento = fechaProximoEvento;
    }

    public String getRaza() {
        return raza;
    }

    public void setRaza(String raza) {
        this.raza = raza;
    }

    public String getTipo() {
        return tipoEvento != null ? tipoEvento : tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
        this.tipoEvento = tipo;
    }

    public String getFechaProgramada() {
        return fechaProgramada != null ? fechaProgramada : fechaEvento;
    }

    public void setFechaProgramada(String fechaProgramada) {
        this.fechaProgramada = fechaProgramada;
        this.fechaEvento = fechaProgramada;
    }

    public String getFechaRealizada() {
        return fechaRealizada;
    }

    public void setFechaRealizada(String fechaRealizada) {
        this.fechaRealizada = fechaRealizada;
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
