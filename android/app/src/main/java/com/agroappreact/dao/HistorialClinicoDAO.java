package com.agroappreact.dao;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import com.agroappreact.database.DatabaseHelper;
import com.agroappreact.models.HistorialClinico;
import java.util.ArrayList;
import java.util.List;

public class HistorialClinicoDAO {
    private DatabaseHelper dbHelper;
    
    public HistorialClinicoDAO(DatabaseHelper dbHelper) {
        this.dbHelper = dbHelper;
    }
    
    public long insertarHistorial(HistorialClinico historial) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();
        
        values.put(DatabaseHelper.COL_HISTORIAL_ANIMAL_ID, historial.getAnimalId());
        values.put(DatabaseHelper.COL_HISTORIAL_FECHA, historial.getFecha());
        values.put(DatabaseHelper.COL_HISTORIAL_ENFERMEDAD, historial.getEnfermedad());
        values.put(DatabaseHelper.COL_HISTORIAL_SINTOMAS, historial.getSintomas());
        values.put(DatabaseHelper.COL_HISTORIAL_TRATAMIENTO, historial.getTratamiento());
        values.put(DatabaseHelper.COL_HISTORIAL_ESTADO, historial.getEstado());
        values.put(DatabaseHelper.COL_HISTORIAL_OBSERVACIONES, historial.getObservaciones());
        
        return db.insert(DatabaseHelper.TABLE_HISTORIAL_CLINICO, null, values);
    }
    
    public int actualizarHistorial(HistorialClinico historial) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();
        
        values.put(DatabaseHelper.COL_HISTORIAL_ANIMAL_ID, historial.getAnimalId());
        values.put(DatabaseHelper.COL_HISTORIAL_FECHA, historial.getFecha());
        values.put(DatabaseHelper.COL_HISTORIAL_ENFERMEDAD, historial.getEnfermedad());
        values.put(DatabaseHelper.COL_HISTORIAL_SINTOMAS, historial.getSintomas());
        values.put(DatabaseHelper.COL_HISTORIAL_TRATAMIENTO, historial.getTratamiento());
        values.put(DatabaseHelper.COL_HISTORIAL_ESTADO, historial.getEstado());
        values.put(DatabaseHelper.COL_HISTORIAL_OBSERVACIONES, historial.getObservaciones());
        
        return db.update(DatabaseHelper.TABLE_HISTORIAL_CLINICO, values,
            DatabaseHelper.COL_HISTORIAL_ID + "=?",
            new String[]{String.valueOf(historial.getId())});
    }
    
    public int eliminarHistorial(int id) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        return db.delete(DatabaseHelper.TABLE_HISTORIAL_CLINICO,
            DatabaseHelper.COL_HISTORIAL_ID + "=?",
            new String[]{String.valueOf(id)});
    }
    
    public List<HistorialClinico> obtenerHistorialPorAnimal(int animalId) {
        List<HistorialClinico> historiales = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        
        Cursor cursor = db.query(
            DatabaseHelper.TABLE_HISTORIAL_CLINICO,
            null,
            DatabaseHelper.COL_HISTORIAL_ANIMAL_ID + "=?",
            new String[]{String.valueOf(animalId)},
            null, null,
            DatabaseHelper.COL_HISTORIAL_FECHA + " DESC"
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            do {
                historiales.add(cursorToHistorial(cursor));
            } while (cursor.moveToNext());
            cursor.close();
        }
        
        return historiales;
    }
    
    private HistorialClinico cursorToHistorial(Cursor cursor) {
        return new HistorialClinico(
            cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_HISTORIAL_ID)),
            cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_HISTORIAL_ANIMAL_ID)),
            cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_HISTORIAL_FECHA)),
            cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_HISTORIAL_ENFERMEDAD)),
            cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_HISTORIAL_SINTOMAS)),
            cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_HISTORIAL_TRATAMIENTO)),
            cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_HISTORIAL_ESTADO)),
            cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_HISTORIAL_OBSERVACIONES))
        );
    }
}
