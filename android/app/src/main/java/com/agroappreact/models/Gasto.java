package com.agroappreact.models;

/**
 * Modelo para registrar gastos del hato o de animales específicos.
 * animal_id puede ser null para gastos generales del hato.
 */
public class Gasto {
    private int id;
    private Integer animalId;  // Nullable: null = gasto general de hato
    private String categoria;   // CHECK: ALIMENTACION, MEDICAMENTOS, TRASLADO, VETERINARIO, OTRO
    private String descripcion;
    private double monto;      // CHECK: monto >= 0
    private String fecha;      // TEXT NOT NULL
    private String notas;      // Nullable
    
    public Gasto() {}
    
    /**
     * Constructor completo
     */
    public Gasto(int id, Integer animalId, String categoria, String descripcion, 
                 double monto, String fecha, String notas) {
        this.id = id;
        this.animalId = animalId;
        this.categoria = categoria;
        this.descripcion = descripcion;
        this.monto = monto;
        this.fecha = fecha;
        this.notas = notas;
    }
    
    /**
     * Constructor sin ID (para inserciones)
     */
    public Gasto(Integer animalId, String categoria, String descripcion, 
                 double monto, String fecha, String notas) {
        this.animalId = animalId;
        this.categoria = categoria;
        this.descripcion = descripcion;
        this.monto = monto;
        this.fecha = fecha;
        this.notas = notas;
    }
    
    // Getters y Setters
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public Integer getAnimalId() {
        return animalId;
    }
    
    public void setAnimalId(Integer animalId) {
        this.animalId = animalId;
    }
    
    public String getCategoria() {
        return categoria;
    }
    
    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
    
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
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
    
    public String getNotas() {
        return notas;
    }
    
    public void setNotas(String notas) {
        this.notas = notas;
    }
    
    /**
     * Validar que el gasto cumpla con los constraints
     */
    public boolean esValido() {
        return monto >= 0 && 
               categoria != null && 
               descripcion != null && 
               fecha != null &&
               !descripcion.isEmpty() &&
               !fecha.isEmpty();
    }
}
