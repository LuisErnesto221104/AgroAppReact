package com.agroappreact.dao;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import com.agroappreact.database.DatabaseHelper;
import com.agroappreact.models.Animal;
import java.util.ArrayList;
import java.util.List;

public class AnimalDAO {
    private DatabaseHelper dbHelper;
    
    public AnimalDAO(DatabaseHelper dbHelper) {
        this.dbHelper = dbHelper;
    }
    
    public boolean existeArete(String numeroArete) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Cursor cursor = db.query(
            DatabaseHelper.TABLE_ANIMALES,
            new String[]{DatabaseHelper.COL_ANIMAL_ID},
            DatabaseHelper.COL_ANIMAL_ARETE + "=?",
            new String[]{numeroArete},
            null, null, null
        );
        
        boolean existe = cursor != null && cursor.getCount() > 0;
        if (cursor != null) {
            cursor.close();
        }
        return existe;
    }
    
    public long insertarAnimal(Animal animal) {
        // Verificar si ya existe un animal con el mismo arete
        if (existeArete(animal.getNumeroArete())) {
            return -1;
        }
        
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();
        
        values.put(DatabaseHelper.COL_ANIMAL_ARETE, animal.getNumeroArete());
        values.put(DatabaseHelper.COL_ANIMAL_NOMBRE, animal.getNombre());
        values.put(DatabaseHelper.COL_ANIMAL_RAZA, animal.getRaza());
        values.put(DatabaseHelper.COL_ANIMAL_SEXO, animal.getSexo());
        values.put(DatabaseHelper.COL_ANIMAL_FECHA_NACIMIENTO, animal.getFechaNacimiento());
        values.put(DatabaseHelper.COL_ANIMAL_FECHA_INGRESO, animal.getFechaIngreso());
        values.put(DatabaseHelper.COL_ANIMAL_FECHA_SALIDA, animal.getFechaSalida());
        values.put(DatabaseHelper.COL_ANIMAL_PRECIO_COMPRA, animal.getPrecioCompra());
        values.put(DatabaseHelper.COL_ANIMAL_PRECIO_VENTA, animal.getPrecioVenta());
        values.put(DatabaseHelper.COL_ANIMAL_FOTO, animal.getFoto());
        values.put(DatabaseHelper.COL_ANIMAL_ESTADO, animal.getEstado());
        values.put(DatabaseHelper.COL_ANIMAL_OBSERVACIONES, animal.getObservaciones());
        values.put(DatabaseHelper.COL_ANIMAL_PESO_NACER, animal.getPesoNacer());
        values.put(DatabaseHelper.COL_ANIMAL_PESO_ACTUAL, animal.getPesoActual());
        
        return db.insert(DatabaseHelper.TABLE_ANIMALES, null, values);
    }
    
    public int actualizarAnimal(Animal animal) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();
        
        values.put(DatabaseHelper.COL_ANIMAL_ARETE, animal.getNumeroArete());
        values.put(DatabaseHelper.COL_ANIMAL_NOMBRE, animal.getNombre());
        values.put(DatabaseHelper.COL_ANIMAL_RAZA, animal.getRaza());
        values.put(DatabaseHelper.COL_ANIMAL_SEXO, animal.getSexo());
        values.put(DatabaseHelper.COL_ANIMAL_FECHA_NACIMIENTO, animal.getFechaNacimiento());
        values.put(DatabaseHelper.COL_ANIMAL_FECHA_INGRESO, animal.getFechaIngreso());
        values.put(DatabaseHelper.COL_ANIMAL_FECHA_SALIDA, animal.getFechaSalida());
        values.put(DatabaseHelper.COL_ANIMAL_PRECIO_COMPRA, animal.getPrecioCompra());
        values.put(DatabaseHelper.COL_ANIMAL_PRECIO_VENTA, animal.getPrecioVenta());
        values.put(DatabaseHelper.COL_ANIMAL_FOTO, animal.getFoto());
        values.put(DatabaseHelper.COL_ANIMAL_ESTADO, animal.getEstado());
        values.put(DatabaseHelper.COL_ANIMAL_OBSERVACIONES, animal.getObservaciones());
        values.put(DatabaseHelper.COL_ANIMAL_PESO_NACER, animal.getPesoNacer());
        values.put(DatabaseHelper.COL_ANIMAL_PESO_ACTUAL, animal.getPesoActual());
        
        return db.update(DatabaseHelper.TABLE_ANIMALES, values,
            DatabaseHelper.COL_ANIMAL_ID + "=?",
            new String[]{String.valueOf(animal.getId())});
    }
    
    public int eliminarAnimal(int id) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        return db.delete(DatabaseHelper.TABLE_ANIMALES,
            DatabaseHelper.COL_ANIMAL_ID + "=?",
            new String[]{String.valueOf(id)});
    }
    
    public Animal obtenerAnimalPorId(int id) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Animal animal = null;
        
        Cursor cursor = db.query(
            DatabaseHelper.TABLE_ANIMALES,
            null,
            DatabaseHelper.COL_ANIMAL_ID + "=?",
            new String[]{String.valueOf(id)},
            null, null, null
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            animal = cursorToAnimal(cursor);
            cursor.close();
        }
        
        return animal;
    }
    
    public Animal obtenerAnimalPorArete(String arete) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Animal animal = null;
        
        Cursor cursor = db.query(
            DatabaseHelper.TABLE_ANIMALES,
            null,
            DatabaseHelper.COL_ANIMAL_ARETE + "=?",
            new String[]{arete},
            null, null, null
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            animal = cursorToAnimal(cursor);
            cursor.close();
        }
        
        return animal;
    }
    
    public int obtenerIdPorArete(String arete) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        int id = -1;
        
        Cursor cursor = db.query(
            DatabaseHelper.TABLE_ANIMALES,
            new String[]{DatabaseHelper.COL_ANIMAL_ID},
            DatabaseHelper.COL_ANIMAL_ARETE + "=?",
            new String[]{arete},
            null, null, null
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            id = cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ANIMAL_ID));
            cursor.close();
        }
        
        return id;
    }
    
    public int eliminarAnimalPorArete(String arete) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        return db.delete(DatabaseHelper.TABLE_ANIMALES,
            DatabaseHelper.COL_ANIMAL_ARETE + "=?",
            new String[]{arete});
    }
    
    public List<Animal> obtenerTodosLosAnimales() {
        List<Animal> animales = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        
        Cursor cursor = db.query(
            DatabaseHelper.TABLE_ANIMALES,
            null, null, null, null, null,
            DatabaseHelper.COL_ANIMAL_NOMBRE + " ASC"
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            do {
                animales.add(cursorToAnimal(cursor));
            } while (cursor.moveToNext());
            cursor.close();
        }
        
        return animales;
    }
    
    public List<Animal> obtenerTodos() {
        return obtenerTodosLosAnimales();
    }
    
    public List<Animal> obtenerAnimalesPorEstado(String estado) {
        List<Animal> animales = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        
        Cursor cursor = db.query(
            DatabaseHelper.TABLE_ANIMALES,
            null,
            DatabaseHelper.COL_ANIMAL_ESTADO + "=?",
            new String[]{estado},
            null, null,
            DatabaseHelper.COL_ANIMAL_NOMBRE + " ASC"
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            do {
                animales.add(cursorToAnimal(cursor));
            } while (cursor.moveToNext());
            cursor.close();
        }
        
        return animales;
    }
    
    private Animal cursorToAnimal(Cursor cursor) {
        Animal animal = new Animal();
        animal.setId(cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ANIMAL_ID)));
        animal.setNumeroArete(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ANIMAL_ARETE)));
        animal.setNombre(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ANIMAL_NOMBRE)));
        animal.setRaza(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ANIMAL_RAZA)));
        animal.setSexo(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ANIMAL_SEXO)));
        animal.setFechaNacimiento(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ANIMAL_FECHA_NACIMIENTO)));
        animal.setFechaIngreso(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ANIMAL_FECHA_INGRESO)));
        animal.setFechaSalida(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ANIMAL_FECHA_SALIDA)));
        animal.setPrecioCompra(cursor.getDouble(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ANIMAL_PRECIO_COMPRA)));
        animal.setPrecioVenta(cursor.getDouble(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ANIMAL_PRECIO_VENTA)));
        animal.setFoto(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ANIMAL_FOTO)));
        animal.setEstado(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ANIMAL_ESTADO)));
        animal.setObservaciones(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ANIMAL_OBSERVACIONES)));
        
        int pesoNacerIndex = cursor.getColumnIndex(DatabaseHelper.COL_ANIMAL_PESO_NACER);
        int pesoActualIndex = cursor.getColumnIndex(DatabaseHelper.COL_ANIMAL_PESO_ACTUAL);
        if (pesoNacerIndex != -1 && !cursor.isNull(pesoNacerIndex)) {
            animal.setPesoNacer(cursor.getDouble(pesoNacerIndex));
        }
        if (pesoActualIndex != -1 && !cursor.isNull(pesoActualIndex)) {
            animal.setPesoActual(cursor.getDouble(pesoActualIndex));
        }
        
        return animal;
    }
}
