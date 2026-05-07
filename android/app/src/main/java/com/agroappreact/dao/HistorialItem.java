package com.agroappreact.dao;

public class HistorialItem {
    private int id;
    private int animalId;
    private String arete;
    private String tipoEvento;
    private String descripcion;
    private String fechaEvento;
    private String veterinario;
    private String dosis;
    private String observaciones;

    public HistorialItem() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getAnimalId() { return animalId; }
    public void setAnimalId(int animalId) { this.animalId = animalId; }

    public String getArete() { return arete; }
    public void setArete(String arete) { this.arete = arete; }

    public String getTipoEvento() { return tipoEvento; }
    public void setTipoEvento(String tipoEvento) { this.tipoEvento = tipoEvento; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getFechaEvento() { return fechaEvento; }
    public void setFechaEvento(String fechaEvento) { this.fechaEvento = fechaEvento; }

    public String getVeterinario() { return veterinario; }
    public void setVeterinario(String veterinario) { this.veterinario = veterinario; }

    public String getDosis() { return dosis; }
    public void setDosis(String dosis) { this.dosis = dosis; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
}
