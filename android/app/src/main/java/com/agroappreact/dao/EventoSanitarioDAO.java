package com.agroappreact.dao;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.text.TextUtils;
import com.agroappreact.database.DatabaseHelper;
import com.agroappreact.models.EventoSanitario;
import java.util.ArrayList;
import java.util.List;

public class EventoSanitarioDAO {
    private final DatabaseHelper dbHelper;
    
    public EventoSanitarioDAO(DatabaseHelper dbHelper) {
        this.dbHelper = dbHelper;
    }
    
    public long insertarEvento(EventoSanitario evento) {
        if (evento == null || !animalExiste(evento.getAnimalId())) {
            return -1;
        }

        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();

        values.put(DatabaseHelper.COL_EVENTO_SANITARIO_ANIMAL_ID, evento.getAnimalId());
        values.put(DatabaseHelper.COL_EVENTO_SANITARIO_TIPO_EVENTO, evento.getTipoEvento());
        values.put(DatabaseHelper.COL_EVENTO_SANITARIO_DESCRIPCION, evento.getDescripcion());
        values.put(DatabaseHelper.COL_EVENTO_SANITARIO_FECHA_EVENTO, evento.getFechaEvento());
        values.put(DatabaseHelper.COL_EVENTO_SANITARIO_VETERINARIO, evento.getVeterinario());
        values.put(DatabaseHelper.COL_EVENTO_SANITARIO_DOSIS, evento.getDosis());
        values.put(DatabaseHelper.COL_EVENTO_SANITARIO_OBSERVACIONES, evento.getObservaciones());
        values.put(DatabaseHelper.COL_EVENTO_SANITARIO_FECHA_PROXIMO_EVENTO, evento.getFechaProximoEvento());

        return db.insert(DatabaseHelper.TABLE_EVENTOS_SANITARIOS, null, values);
    }
    
    public int actualizarEvento(EventoSanitario evento) {
        if (evento == null || evento.getId() <= 0 || !animalExiste(evento.getAnimalId())) {
            return 0;
        }

        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();

        values.put(DatabaseHelper.COL_EVENTO_SANITARIO_ANIMAL_ID, evento.getAnimalId());
        values.put(DatabaseHelper.COL_EVENTO_SANITARIO_TIPO_EVENTO, evento.getTipoEvento());
        values.put(DatabaseHelper.COL_EVENTO_SANITARIO_DESCRIPCION, evento.getDescripcion());
        values.put(DatabaseHelper.COL_EVENTO_SANITARIO_FECHA_EVENTO, evento.getFechaEvento());
        values.put(DatabaseHelper.COL_EVENTO_SANITARIO_VETERINARIO, evento.getVeterinario());
        values.put(DatabaseHelper.COL_EVENTO_SANITARIO_DOSIS, evento.getDosis());
        values.put(DatabaseHelper.COL_EVENTO_SANITARIO_OBSERVACIONES, evento.getObservaciones());
        values.put(DatabaseHelper.COL_EVENTO_SANITARIO_FECHA_PROXIMO_EVENTO, evento.getFechaProximoEvento());

        return db.update(
            DatabaseHelper.TABLE_EVENTOS_SANITARIOS,
            values,
            DatabaseHelper.COL_EVENTO_SANITARIO_ID + "=?",
            new String[]{String.valueOf(evento.getId())}
        );
    }
    
    public boolean eliminarEvento(int id) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        int rows = db.delete(
            DatabaseHelper.TABLE_EVENTOS_SANITARIOS,
            DatabaseHelper.COL_EVENTO_SANITARIO_ID + "=?",
            new String[]{String.valueOf(id)}
        );
        return rows > 0;
    }
    
    public List<EventoSanitario> obtenerTodosLosEventos() {
        List<EventoSanitario> eventos = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();

        Cursor cursor = null;
        try {
            cursor = db.query(
                DatabaseHelper.TABLE_EVENTOS_SANITARIOS,
                null,
                null,
                null,
                null,
                null,
                DatabaseHelper.COL_EVENTO_SANITARIO_FECHA_EVENTO + " DESC"
            );

            if (cursor != null && cursor.moveToFirst()) {
                do {
                    eventos.add(cursorToEvento(cursor));
                } while (cursor.moveToNext());
            }
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
        
        return eventos;
    }
    
    public List<EventoSanitario> obtenerEventosPorAnimal(int animalId) {
        List<EventoSanitario> eventos = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();

        Cursor cursor = null;
        try {
            cursor = db.query(
                DatabaseHelper.TABLE_EVENTOS_SANITARIOS,
                null,
                DatabaseHelper.COL_EVENTO_SANITARIO_ANIMAL_ID + "=?",
                new String[]{String.valueOf(animalId)},
                null,
                null,
                DatabaseHelper.COL_EVENTO_SANITARIO_FECHA_EVENTO + " DESC"
            );

            if (cursor != null && cursor.moveToFirst()) {
                do {
                    eventos.add(cursorToEvento(cursor));
                } while (cursor.moveToNext());
            }
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
        
        return eventos;
    }

    public List<EventoSanitario> obtenerEventosPorMes(int year, int month) {
        List<EventoSanitario> eventos = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();

        String prefix = String.format(java.util.Locale.US, "%04d-%02d", year, month);
        String like = prefix + "%";

        Cursor cursor = null;
        try {
            String sql = "SELECT e.*, a." + DatabaseHelper.COL_ANIMAL_ARETE + " FROM " +
                    DatabaseHelper.TABLE_EVENTOS_SANITARIOS + " e " +
                    "LEFT JOIN " + DatabaseHelper.TABLE_ANIMALES + " a ON e." + DatabaseHelper.COL_EVENTO_SANITARIO_ANIMAL_ID + " = a." + DatabaseHelper.COL_ANIMAL_ID + " " +
                    "WHERE e." + DatabaseHelper.COL_EVENTO_SANITARIO_FECHA_EVENTO + " LIKE ? OR e." + DatabaseHelper.COL_EVENTO_SANITARIO_FECHA_PROXIMO_EVENTO + " LIKE ? " +
                    "ORDER BY e." + DatabaseHelper.COL_EVENTO_SANITARIO_FECHA_EVENTO + " DESC";

            cursor = db.rawQuery(sql, new String[]{like, like});

            if (cursor != null && cursor.moveToFirst()) {
                do {
                    eventos.add(cursorToEventoWithArete(cursor));
                } while (cursor.moveToNext());
            }
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }

        return eventos;
    }
    
    public boolean animalExiste(int animalId) {
        if (animalId <= 0) {
            return false;
        }

        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Cursor cursor = null;
        try {
            cursor = db.query(
                DatabaseHelper.TABLE_ANIMALES,
                new String[]{DatabaseHelper.COL_ANIMAL_ID},
                DatabaseHelper.COL_ANIMAL_ID + "=?",
                new String[]{String.valueOf(animalId)},
                null,
                null,
                null
            );
            return cursor != null && cursor.moveToFirst();
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
    }
    
    private EventoSanitario cursorToEvento(Cursor cursor) {
        EventoSanitario evento = new EventoSanitario();
        evento.setId(cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_ID)));
        evento.setAnimalId(cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_ANIMAL_ID)));
        evento.setTipoEvento(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_TIPO_EVENTO)));
        evento.setDescripcion(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_DESCRIPCION)));
        evento.setFechaEvento(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_FECHA_EVENTO)));
        evento.setVeterinario(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_VETERINARIO)));
        evento.setDosis(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_DOSIS)));
        evento.setObservaciones(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_OBSERVACIONES)));
        evento.setFechaProximoEvento(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_FECHA_PROXIMO_EVENTO)));
        return evento;
    }

    private EventoSanitario cursorToEventoWithArete(Cursor cursor) {
        EventoSanitario evento = new EventoSanitario();
        evento.setId(cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_ID)));
        evento.setAnimalId(cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_ANIMAL_ID)));
        evento.setTipoEvento(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_TIPO_EVENTO)));
        evento.setDescripcion(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_DESCRIPCION)));
        evento.setFechaEvento(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_FECHA_EVENTO)));
        evento.setVeterinario(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_VETERINARIO)));
        evento.setDosis(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_DOSIS)));
        evento.setObservaciones(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_OBSERVACIONES)));
        evento.setFechaProximoEvento(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_FECHA_PROXIMO_EVENTO)));
        
        // Agregar arete desde el JOIN con tabla Animals
        try {
            String arete = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ANIMAL_ARETE));
            evento.setArete(arete);
        } catch (IllegalArgumentException e) {
            evento.setArete(null);
        }
        
        return evento;
    }
}
