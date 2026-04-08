package com.agroappreact.dao;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import com.agroappreact.database.DatabaseHelper;
import com.agroappreact.models.Alimentacion;
import java.util.ArrayList;
import java.util.List;

public class AlimentacionDAO {
    private DatabaseHelper dbHelper;
    
    public AlimentacionDAO(DatabaseHelper dbHelper) {
        this.dbHelper = dbHelper;
    }
    
    public long insertarAlimentacion(Alimentacion alimentacion) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();
        
        values.put(DatabaseHelper.COL_ALIMENTACION_ANIMAL_ID, alimentacion.getAnimalId());
        values.put(DatabaseHelper.COL_ALIMENTACION_TIPO_ALIMENTO, alimentacion.getTipoAlimento());
        values.put(DatabaseHelper.COL_ALIMENTACION_CANTIDAD, alimentacion.getCantidad());
        values.put(DatabaseHelper.COL_ALIMENTACION_UNIDAD, alimentacion.getUnidad());
        values.put(DatabaseHelper.COL_ALIMENTACION_FECHA, alimentacion.getFecha());
        values.put(DatabaseHelper.COL_ALIMENTACION_COSTO, alimentacion.getCosto());
        values.put(DatabaseHelper.COL_ALIMENTACION_OBSERVACIONES, alimentacion.getObservaciones());
        
        return db.insert(DatabaseHelper.TABLE_ALIMENTACION, null, values);
    }
    
    public int actualizarAlimentacion(Alimentacion alimentacion) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();
        
        values.put(DatabaseHelper.COL_ALIMENTACION_ANIMAL_ID, alimentacion.getAnimalId());
        values.put(DatabaseHelper.COL_ALIMENTACION_TIPO_ALIMENTO, alimentacion.getTipoAlimento());
        values.put(DatabaseHelper.COL_ALIMENTACION_CANTIDAD, alimentacion.getCantidad());
        values.put(DatabaseHelper.COL_ALIMENTACION_UNIDAD, alimentacion.getUnidad());
        values.put(DatabaseHelper.COL_ALIMENTACION_FECHA, alimentacion.getFecha());
        values.put(DatabaseHelper.COL_ALIMENTACION_COSTO, alimentacion.getCosto());
        values.put(DatabaseHelper.COL_ALIMENTACION_OBSERVACIONES, alimentacion.getObservaciones());
        
        return db.update(DatabaseHelper.TABLE_ALIMENTACION, values,
            DatabaseHelper.COL_ALIMENTACION_ID + "=?",
            new String[]{String.valueOf(alimentacion.getId())});
    }
    
    public int eliminarAlimentacion(int id) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        return db.delete(DatabaseHelper.TABLE_ALIMENTACION,
            DatabaseHelper.COL_ALIMENTACION_ID + "=?",
            new String[]{String.valueOf(id)});
    }
    
    public List<Alimentacion> obtenerAlimentacionPorAnimal(int animalId) {
        List<Alimentacion> alimentaciones = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        
        Cursor cursor = db.query(
            DatabaseHelper.TABLE_ALIMENTACION,
            null,
            DatabaseHelper.COL_ALIMENTACION_ANIMAL_ID + "=?",
            new String[]{String.valueOf(animalId)},
            null, null,
            DatabaseHelper.COL_ALIMENTACION_FECHA + " DESC"
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            do {
                alimentaciones.add(cursorToAlimentacion(cursor));
            } while (cursor.moveToNext());
            cursor.close();
        }
        
        return alimentaciones;
    }
    
    private Alimentacion cursorToAlimentacion(Cursor cursor) {
        return new Alimentacion(
            cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ALIMENTACION_ID)),
            cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ALIMENTACION_ANIMAL_ID)),
            cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ALIMENTACION_TIPO_ALIMENTO)),
            cursor.getDouble(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ALIMENTACION_CANTIDAD)),
            cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ALIMENTACION_UNIDAD)),
            cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ALIMENTACION_FECHA)),
            cursor.getDouble(cursor.getColumnIndex(DatabaseHelper.COL_ALIMENTACION_COSTO) != -1 ? cursor.getColumnIndex(DatabaseHelper.COL_ALIMENTACION_COSTO) : 0),
            cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ALIMENTACION_OBSERVACIONES))
        );
    }
}
