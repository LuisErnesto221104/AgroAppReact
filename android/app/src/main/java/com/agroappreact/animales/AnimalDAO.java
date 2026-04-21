package com.agroappreact.animales;

import android.content.ContentValues;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteException;

public class AnimalDAO {

    private final com.agroappreact.database.DatabaseHelper dbHelper;

    public AnimalDAO(com.agroappreact.database.DatabaseHelper dbHelper) {
        this.dbHelper = dbHelper;
    }

    public long insertAnimal(String arete, String especie, String sexo, String fecha, Double peso, String foto) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        db.beginTransaction();
        try {
            db.execSQL(DatabaseHelper.animalesDDL());

            ContentValues values = new ContentValues();
            values.put(DatabaseHelper.COL_ARETE, arete);
            values.put(DatabaseHelper.COL_ESPECIE, especie);
            values.put(DatabaseHelper.COL_SEXO, sexo);
            values.put(DatabaseHelper.COL_FECHA, fecha);
            if (peso != null) {
                values.put(DatabaseHelper.COL_PESO, peso);
            }
            values.put(DatabaseHelper.COL_FOTO, foto);

            long id = db.insertOrThrow(DatabaseHelper.TABLE_ANIMALES, null, values);
            db.setTransactionSuccessful();
            return id;
        } catch (SQLiteException e) {
            throw e;
        } finally {
            db.endTransaction();
        }
    }
}
