package com.agroappreact.dao;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;

import com.agroappreact.database.DatabaseHelper;
import com.agroappreact.models.Gasto;

import java.util.ArrayList;
import java.util.List;

/**
 * DAO para gestionar gastos del hato o por animal.
 * Usa try-finally para garantizar cierre de cursores.
 */
public class GastoDAO {
    private DatabaseHelper dbHelper;
    
    public GastoDAO(DatabaseHelper dbHelper) {
        this.dbHelper = dbHelper;
    }
    
    /**
     * Inserta un nuevo gasto
     * @param gasto Gasto a insertar (sin ID)
     * @return ID del gasto insertado, -1 si falla
     */
    public long insertarGasto(Gasto gasto) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();
        
        // animal_id puede ser null (gasto general del hato)
        if (gasto.getAnimalId() != null && gasto.getAnimalId() > 0) {
            values.put(DatabaseHelper.COL_GASTO_ANIMAL_ID, gasto.getAnimalId());
        }
        
        values.put(DatabaseHelper.COL_GASTO_CATEGORIA, gasto.getCategoria());
        values.put(DatabaseHelper.COL_GASTO_DESCRIPCION, gasto.getDescripcion());
        values.put(DatabaseHelper.COL_GASTO_MONTO, gasto.getMonto());
        values.put(DatabaseHelper.COL_GASTO_FECHA, gasto.getFecha());
        values.put(DatabaseHelper.COL_GASTO_NOTAS, gasto.getNotas());
        
        return db.insert(DatabaseHelper.TABLE_GASTOS, null, values);
    }
    
    /**
     * Obtiene todos los gastos
     * @return Lista de gastos ordenados por fecha DESC
     */
    public List<Gasto> obtenerTodosGastos() {
        List<Gasto> gastos = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        
        Cursor cursor = null;
        try {
            cursor = db.query(
                DatabaseHelper.TABLE_GASTOS,
                null, null, null, null, null,
                DatabaseHelper.COL_GASTO_FECHA + " DESC"
            );
            
            if (cursor != null && cursor.moveToFirst()) {
                do {
                    gastos.add(cursorToGasto(cursor));
                } while (cursor.moveToNext());
            }
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
        
        return gastos;
    }
    
    /**
     * Obtiene gastos por animal específico
     * @param animalId ID del animal
     * @return Lista de gastos del animal
     */
    public List<Gasto> obtenerGastosPorAnimal(int animalId) {
        List<Gasto> gastos = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        
        Cursor cursor = null;
        try {
            cursor = db.query(
                DatabaseHelper.TABLE_GASTOS,
                null,
                DatabaseHelper.COL_GASTO_ANIMAL_ID + "=?",
                new String[]{String.valueOf(animalId)},
                null, null,
                DatabaseHelper.COL_GASTO_FECHA + " DESC"
            );
            
            if (cursor != null && cursor.moveToFirst()) {
                do {
                    gastos.add(cursorToGasto(cursor));
                } while (cursor.moveToNext());
            }
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
        
        return gastos;
    }
    
    /**
     * Obtiene todos los gastos generales (animal_id IS NULL)
     * @return Lista de gastos del hato
     */
    public List<Gasto> obtenerGastosGenerales() {
        List<Gasto> gastos = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        
        Cursor cursor = null;
        try {
            cursor = db.query(
                DatabaseHelper.TABLE_GASTOS,
                null,
                DatabaseHelper.COL_GASTO_ANIMAL_ID + " IS NULL",
                null,
                null, null,
                DatabaseHelper.COL_GASTO_FECHA + " DESC"
            );
            
            if (cursor != null && cursor.moveToFirst()) {
                do {
                    gastos.add(cursorToGasto(cursor));
                } while (cursor.moveToNext());
            }
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
        
        return gastos;
    }
    
    /**
     * Actualiza un gasto existente
     * @param gasto Gasto con ID y datos nuevos
     * @return Número de filas actualizadas
     */
    public int actualizarGasto(Gasto gasto) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();
        
        if (gasto.getAnimalId() != null && gasto.getAnimalId() > 0) {
            values.put(DatabaseHelper.COL_GASTO_ANIMAL_ID, gasto.getAnimalId());
        } else {
            values.putNull(DatabaseHelper.COL_GASTO_ANIMAL_ID);
        }
        
        values.put(DatabaseHelper.COL_GASTO_CATEGORIA, gasto.getCategoria());
        values.put(DatabaseHelper.COL_GASTO_DESCRIPCION, gasto.getDescripcion());
        values.put(DatabaseHelper.COL_GASTO_MONTO, gasto.getMonto());
        values.put(DatabaseHelper.COL_GASTO_FECHA, gasto.getFecha());
        values.put(DatabaseHelper.COL_GASTO_NOTAS, gasto.getNotas());
        
        return db.update(DatabaseHelper.TABLE_GASTOS, values,
            DatabaseHelper.COL_GASTO_ID + "=?",
            new String[]{String.valueOf(gasto.getId())});
    }
    
    /**
     * Elimina un gasto
     * @param id ID del gasto
     * @return true si se eliminó, false en caso contrario
     */
    public boolean eliminarGasto(int id) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        int filas = db.delete(DatabaseHelper.TABLE_GASTOS,
            DatabaseHelper.COL_GASTO_ID + "=?",
            new String[]{String.valueOf(id)});
        return filas > 0;
    }
    
    /**
     * Suma los gastos de un animal específico
     * @param animalId ID del animal
     * @return Suma total de gastos del animal
     */
    public double sumarGastosPorAnimal(int animalId) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        double total = 0;
        
        Cursor cursor = null;
        try {
            cursor = db.rawQuery(
                "SELECT SUM(" + DatabaseHelper.COL_GASTO_MONTO + ") as total FROM " + 
                DatabaseHelper.TABLE_GASTOS + " WHERE " + DatabaseHelper.COL_GASTO_ANIMAL_ID + "=?",
                new String[]{String.valueOf(animalId)}
            );
            
            if (cursor != null && cursor.moveToFirst()) {
                total = cursor.getDouble(cursor.getColumnIndexOrThrow("total"));
                if (cursor.isNull(cursor.getColumnIndexOrThrow("total"))) {
                    total = 0;
                }
            }
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
        
        return total;
    }
    
    /**
     * Obtiene el total de gastos generales del hato
     * @return Suma total de gastos generales
     */
    public double sumarGastosGenerales() {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        double total = 0;
        
        Cursor cursor = null;
        try {
            cursor = db.rawQuery(
                "SELECT SUM(" + DatabaseHelper.COL_GASTO_MONTO + ") as total FROM " + 
                DatabaseHelper.TABLE_GASTOS + " WHERE " + DatabaseHelper.COL_GASTO_ANIMAL_ID + " IS NULL",
                null
            );
            
            if (cursor != null && cursor.moveToFirst()) {
                total = cursor.getDouble(cursor.getColumnIndexOrThrow("total"));
                if (cursor.isNull(cursor.getColumnIndexOrThrow("total"))) {
                    total = 0;
                }
            }
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
        
        return total;
    }
    
    /**
     * Obtiene el total de gastos por categoría
     * @return Map de categoría -> total
     */
    public java.util.Map<String, Double> obtenerTotalPorCategoria() {
        java.util.Map<String, Double> resultado = new java.util.HashMap<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        
        Cursor cursor = null;
        try {
            cursor = db.rawQuery(
                "SELECT " + DatabaseHelper.COL_GASTO_CATEGORIA + ", " +
                "SUM(" + DatabaseHelper.COL_GASTO_MONTO + ") as total FROM " + 
                DatabaseHelper.TABLE_GASTOS + " GROUP BY " + DatabaseHelper.COL_GASTO_CATEGORIA,
                null
            );
            
            if (cursor != null && cursor.moveToFirst()) {
                do {
                    String categoria = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_GASTO_CATEGORIA));
                    double total = cursor.getDouble(cursor.getColumnIndexOrThrow("total"));
                    resultado.put(categoria, total);
                } while (cursor.moveToNext());
            }
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
        
        return resultado;
    }
    
    /**
     * Convierte un cursor a objeto Gasto
     */
    private Gasto cursorToGasto(Cursor cursor) {
        int idColumnIndex = cursor.getColumnIndexOrThrow(DatabaseHelper.COL_GASTO_ID);
        int animalIdColumnIndex = cursor.getColumnIndexOrThrow(DatabaseHelper.COL_GASTO_ANIMAL_ID);
        int categoriaColumnIndex = cursor.getColumnIndexOrThrow(DatabaseHelper.COL_GASTO_CATEGORIA);
        int descripcionColumnIndex = cursor.getColumnIndexOrThrow(DatabaseHelper.COL_GASTO_DESCRIPCION);
        int montoColumnIndex = cursor.getColumnIndexOrThrow(DatabaseHelper.COL_GASTO_MONTO);
        int fechaColumnIndex = cursor.getColumnIndexOrThrow(DatabaseHelper.COL_GASTO_FECHA);
        int notasColumnIndex = cursor.getColumnIndexOrThrow(DatabaseHelper.COL_GASTO_NOTAS);
        
        int id = cursor.getInt(idColumnIndex);
        Integer animalId = cursor.isNull(animalIdColumnIndex) ? null : cursor.getInt(animalIdColumnIndex);
        String categoria = cursor.getString(categoriaColumnIndex);
        String descripcion = cursor.getString(descripcionColumnIndex);
        double monto = cursor.getDouble(montoColumnIndex);
        String fecha = cursor.getString(fechaColumnIndex);
        String notas = cursor.isNull(notasColumnIndex) ? null : cursor.getString(notasColumnIndex);
        
        return new Gasto(id, animalId, categoria, descripcion, monto, fecha, notas);
    }
}
