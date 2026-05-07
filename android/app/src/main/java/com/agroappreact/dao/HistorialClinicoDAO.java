package com.agroappreact.dao;

import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;

import com.agroappreact.database.DatabaseHelper;

import java.util.ArrayList;
import java.util.List;

public class HistorialClinicoDAO {
    private final DatabaseHelper dbHelper;

    public HistorialClinicoDAO(DatabaseHelper dbHelper) {
        this.dbHelper = dbHelper;
    }

    public List<HistorialItem> obtenerHistorialCompleto(int animalId, int pagina, int porPagina) {
        List<HistorialItem> resultado = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();

        int limit = porPagina;
        int offset = pagina * porPagina;

        String sql = "SELECT es.*, a." + DatabaseHelper.COL_ANIMAL_ARETE + " as arete FROM "
            + DatabaseHelper.TABLE_EVENTOS_SANITARIOS + " es INNER JOIN " + DatabaseHelper.TABLE_ANIMALES
            + " a ON es." + DatabaseHelper.COL_EVENTO_SANITARIO_ANIMAL_ID + " = a." + DatabaseHelper.COL_ANIMAL_ID
            + " WHERE es." + DatabaseHelper.COL_EVENTO_SANITARIO_ANIMAL_ID + " = ?"
            + " ORDER BY es." + DatabaseHelper.COL_EVENTO_SANITARIO_FECHA_EVENTO + " DESC LIMIT ? OFFSET ?";

        Cursor cursor = null;
        try {
            cursor = db.rawQuery(sql, new String[]{ String.valueOf(animalId), String.valueOf(limit), String.valueOf(offset) });
            if (cursor != null && cursor.moveToFirst()) {
                do {
                    HistorialItem h = new HistorialItem();
                    h.setId(cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_ID)));
                    h.setAnimalId(cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_ANIMAL_ID)));
                    h.setTipoEvento(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_TIPO_EVENTO)));
                    h.setDescripcion(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_DESCRIPCION)));
                    h.setFechaEvento(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_FECHA_EVENTO)));
                    h.setVeterinario(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_VETERINARIO)));
                    h.setDosis(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_DOSIS)));
                    h.setObservaciones(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_EVENTO_SANITARIO_OBSERVACIONES)));
                    // arete column aliased
                    int areteIndex = cursor.getColumnIndex("arete");
                    if (areteIndex != -1) {
                        h.setArete(cursor.getString(areteIndex));
                    }
                    resultado.add(h);
                } while (cursor.moveToNext());
            }
        } finally {
            if (cursor != null) cursor.close();
        }

        return resultado;
    }

    public int contarEventos(int animalId) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Cursor cursor = null;
        int count = 0;
        try {
            cursor = db.rawQuery("SELECT COUNT(*) FROM " + DatabaseHelper.TABLE_EVENTOS_SANITARIOS + " WHERE " + DatabaseHelper.COL_EVENTO_SANITARIO_ANIMAL_ID + " = ?", new String[]{ String.valueOf(animalId) });
            if (cursor != null && cursor.moveToFirst()) {
                count = cursor.getInt(0);
            }
        } finally {
            if (cursor != null) cursor.close();
        }
        return count;
    }
}
