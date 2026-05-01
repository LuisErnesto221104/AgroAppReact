package com.agroappreact.animales;

public final class DatabaseHelper {

    public static final String TABLE_ANIMALES = "animales";
    public static final String COL_ID = "id";
    public static final String COL_ARETE = "numero_arete";
    public static final String COL_ESPECIE = "especie";
    public static final String COL_SEXO = "sexo";
    public static final String COL_FECHA = "fecha_registro";
    public static final String COL_PESO = "peso";
    public static final String COL_FOTO = "foto";
    public static final String COL_UPDATED_AT = "updated_at";
    public static final String COL_FECHA_BAJA = "fecha_baja";
    public static final String COL_MOTIVO_BAJA = "motivo_baja";
    public static final String COL_NOMBRE = "nombre";
    public static final String COL_ESTADO = "estado";
    public static final String COL_OBSERVACIONES = "observaciones";

    private DatabaseHelper() {
    }

    public static String animalesDDL() {
        return "CREATE TABLE IF NOT EXISTS " + TABLE_ANIMALES + " (" +
                COL_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                COL_ARETE + " TEXT NOT NULL UNIQUE, " +
                COL_ESPECIE + " TEXT NOT NULL, " +
                COL_SEXO + " TEXT NOT NULL, " +
                COL_FECHA + " TEXT NOT NULL, " +
                COL_PESO + " REAL, " +
                COL_FOTO + " TEXT, " +
                COL_UPDATED_AT + " TEXT, " +
                COL_FECHA_BAJA + " TEXT, " +
                COL_MOTIVO_BAJA + " TEXT, " +
                COL_NOMBRE + " TEXT, " +
                COL_ESTADO + " TEXT DEFAULT 'ACTIVO', " +
                COL_OBSERVACIONES + " TEXT" +
                ")";
    }
}
