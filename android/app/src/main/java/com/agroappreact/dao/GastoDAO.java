package com.agroappreact.dao;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import com.agroappreact.database.DatabaseHelper;
import com.agroappreact.models.Gasto;
import java.util.ArrayList;
import java.util.List;

public class GastoDAO {
    private DatabaseHelper dbHelper;
    
    public GastoDAO(DatabaseHelper dbHelper) {
        this.dbHelper = dbHelper;
    }
    
    public long insertarGasto(Gasto gasto) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();
        
        if (gasto.getAnimalId() > 0) {
            values.put(DatabaseHelper.COL_GASTO_ANIMAL_ID, gasto.getAnimalId());
        }
        if (gasto.getRaza() != null && !gasto.getRaza().isEmpty()) {
            values.put(DatabaseHelper.COL_GASTO_RAZA, gasto.getRaza());
        }
        values.put(DatabaseHelper.COL_GASTO_TIPO, gasto.getTipo());
        values.put(DatabaseHelper.COL_GASTO_CONCEPTO, gasto.getConcepto());
        values.put(DatabaseHelper.COL_GASTO_MONTO, gasto.getMonto());
        values.put(DatabaseHelper.COL_GASTO_FECHA, gasto.getFecha());
        values.put(DatabaseHelper.COL_GASTO_OBSERVACIONES, gasto.getObservaciones());
        
        return db.insert(DatabaseHelper.TABLE_GASTOS, null, values);
    }
    
    public int actualizarGasto(Gasto gasto) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();
        
        if (gasto.getAnimalId() > 0) {
            values.put(DatabaseHelper.COL_GASTO_ANIMAL_ID, gasto.getAnimalId());
        }
        if (gasto.getRaza() != null && !gasto.getRaza().isEmpty()) {
            values.put(DatabaseHelper.COL_GASTO_RAZA, gasto.getRaza());
        }
        values.put(DatabaseHelper.COL_GASTO_TIPO, gasto.getTipo());
        values.put(DatabaseHelper.COL_GASTO_CONCEPTO, gasto.getConcepto());
        values.put(DatabaseHelper.COL_GASTO_MONTO, gasto.getMonto());
        values.put(DatabaseHelper.COL_GASTO_FECHA, gasto.getFecha());
        values.put(DatabaseHelper.COL_GASTO_OBSERVACIONES, gasto.getObservaciones());
        
        return db.update(DatabaseHelper.TABLE_GASTOS, values,
            DatabaseHelper.COL_GASTO_ID + "=?",
            new String[]{String.valueOf(gasto.getId())});
    }
    
    public int eliminarGasto(int id) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        return db.delete(DatabaseHelper.TABLE_GASTOS,
            DatabaseHelper.COL_GASTO_ID + "=?",
            new String[]{String.valueOf(id)});
    }
    
    public List<Gasto> obtenerTodosLosGastos() {
        List<Gasto> gastos = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        
        Cursor cursor = db.query(
            DatabaseHelper.TABLE_GASTOS,
            null, null, null, null, null,
            DatabaseHelper.COL_GASTO_FECHA + " DESC"
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            do {
                gastos.add(cursorToGasto(cursor));
            } while (cursor.moveToNext());
            cursor.close();
        }
        
        return gastos;
    }
    
    public List<Gasto> obtenerGastosPorAnimal(int animalId) {
        List<Gasto> gastos = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        
        Cursor cursor = db.query(
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
            cursor.close();
        }
        
        return gastos;
    }
    
    public double obtenerTotalGastos() {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        double total = 0;
        
        Cursor cursor = db.rawQuery(
            "SELECT SUM(" + DatabaseHelper.COL_GASTO_MONTO + ") as total FROM " + 
            DatabaseHelper.TABLE_GASTOS, null
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            total = cursor.getDouble(cursor.getColumnIndexOrThrow("total"));
            cursor.close();
        }
        
        return total;
    }
    
    public double obtenerTotalGastosPorAnimal(int animalId) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        double total = 0;
        
        Cursor cursor = db.rawQuery(
            "SELECT SUM(" + DatabaseHelper.COL_GASTO_MONTO + ") as total FROM " + 
            DatabaseHelper.TABLE_GASTOS + " WHERE " + DatabaseHelper.COL_GASTO_ANIMAL_ID + "=?",
            new String[]{String.valueOf(animalId)}
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            total = cursor.getDouble(cursor.getColumnIndexOrThrow("total"));
            cursor.close();
        }
        
        return total;
    }
    
    private Gasto cursorToGasto(Cursor cursor) {
        Gasto gasto = new Gasto(
            cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_GASTO_ID)),
            cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_GASTO_ANIMAL_ID)),
            cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_GASTO_TIPO)),
            cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_GASTO_CONCEPTO)),
            cursor.getDouble(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_GASTO_MONTO)),
            cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_GASTO_FECHA)),
            cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_GASTO_OBSERVACIONES))
        );
        
        int razaIndex = cursor.getColumnIndex(DatabaseHelper.COL_GASTO_RAZA);
        if (razaIndex != -1) {
            gasto.setRaza(cursor.getString(razaIndex));
        }
        
        return gasto;
    }
}
