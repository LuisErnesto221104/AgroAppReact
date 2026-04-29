package com.agroappreact.animales;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteException;

import java.util.ArrayList;
import java.util.List;

public class AnimalDAO {

    private final com.agroappreact.database.DatabaseHelper dbHelper;

    public AnimalDAO(com.agroappreact.database.DatabaseHelper dbHelper) {
        this.dbHelper = dbHelper;
    }

    public long insertAnimal(String arete, String especie, String sexo, String fecha, Double peso, String fotoPath) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        db.beginTransaction();
        try {
            ensureAnimalesSchema(db);

            ContentValues values = new ContentValues();
            values.put(DatabaseHelper.COL_ARETE, arete);
            values.put(DatabaseHelper.COL_ESPECIE, especie);
            values.put(DatabaseHelper.COL_SEXO, sexo);
            values.put(DatabaseHelper.COL_FECHA, fecha);
            if (peso != null) {
                values.put(DatabaseHelper.COL_PESO, peso);
            }
            values.put(DatabaseHelper.COL_FOTO, fotoPath);
            values.put(DatabaseHelper.COL_ESTADO, "ACTIVO");
            values.putNull(DatabaseHelper.COL_FECHA_BAJA);
            values.putNull(DatabaseHelper.COL_MOTIVO_BAJA);

            long id = db.insertOrThrow(DatabaseHelper.TABLE_ANIMALES, null, values);
            db.setTransactionSuccessful();
            return id;
        } catch (SQLiteException e) {
            throw e;
        } finally {
            db.endTransaction();
        }
    }

    public int updateAnimal(long id, String especie, String sexo, String fecha, Double peso, String fotoPath, String updatedAt) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        db.beginTransaction();
        try {
            ensureAnimalesSchema(db);

            ContentValues values = new ContentValues();
            values.put(DatabaseHelper.COL_ESPECIE, especie);
            values.put(DatabaseHelper.COL_SEXO, sexo);
            values.put(DatabaseHelper.COL_FECHA, fecha);
            if (peso != null) {
                values.put(DatabaseHelper.COL_PESO, peso);
            } else {
                values.putNull(DatabaseHelper.COL_PESO);
            }
            if (fotoPath != null) {
                values.put(DatabaseHelper.COL_FOTO, fotoPath);
            }
            values.put(DatabaseHelper.COL_UPDATED_AT, updatedAt);

            int rows = db.update(
                    DatabaseHelper.TABLE_ANIMALES,
                    values,
                    DatabaseHelper.COL_ID + "=?",
                    new String[]{String.valueOf(id)}
            );
            db.setTransactionSuccessful();
            return rows;
        } finally {
            db.endTransaction();
        }
    }

    public int deleteAnimal(long id) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        db.beginTransaction();
        try {
            ensureAnimalesSchema(db);
            int rows = db.delete(
                    DatabaseHelper.TABLE_ANIMALES,
                    DatabaseHelper.COL_ID + "=?",
                    new String[]{String.valueOf(id)}
            );
            db.setTransactionSuccessful();
            return rows;
        } finally {
            db.endTransaction();
        }
    }

    public AnimalRecord getAnimalById(long id) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        ensureAnimalesSchema(db);

        Cursor cursor = db.query(
                DatabaseHelper.TABLE_ANIMALES,
                null,
                DatabaseHelper.COL_ID + "=?",
                new String[]{String.valueOf(id)},
                null,
                null,
                null,
                "1"
        );

        try {
            if (cursor != null && cursor.moveToFirst()) {
                return fromCursor(cursor);
            }
            return null;
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
    }

    public List<AnimalRecord> listAnimals() {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        ensureAnimalesSchema(db);

        List<AnimalRecord> animals = new ArrayList<>();
        Cursor cursor = db.query(
                DatabaseHelper.TABLE_ANIMALES,
                null,
                null,
                null,
                null,
                null,
                DatabaseHelper.COL_ID + " DESC"
        );

        try {
            if (cursor != null && cursor.moveToFirst()) {
                do {
                    animals.add(fromCursor(cursor));
                } while (cursor.moveToNext());
            }
            return animals;
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
    }

    public List<AnimalRecord> getAnimalesByEstado(String estado) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        ensureAnimalesSchema(db);

        List<AnimalRecord> animals = new ArrayList<>();
        Cursor cursor = db.query(
                DatabaseHelper.TABLE_ANIMALES,
                null,
                DatabaseHelper.COL_ESTADO + "=?",
                new String[]{estado},
                null,
                null,
                DatabaseHelper.COL_ID + " DESC"
        );

        try {
            if (cursor != null && cursor.moveToFirst()) {
                do {
                    animals.add(fromCursor(cursor));
                } while (cursor.moveToNext());
            }
            return animals;
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
    }

    public int changeEstado(long id, String estado, String fechaBaja, String motivoBaja, String updatedAt) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        db.beginTransaction();
        try {
            ensureAnimalesSchema(db);

            ContentValues values = new ContentValues();
            values.put(DatabaseHelper.COL_ESTADO, estado);
            values.put(DatabaseHelper.COL_FECHA_BAJA, fechaBaja);
            values.put(DatabaseHelper.COL_MOTIVO_BAJA, motivoBaja);
            values.put(DatabaseHelper.COL_UPDATED_AT, updatedAt);

            int rows = db.update(
                    DatabaseHelper.TABLE_ANIMALES,
                    values,
                    DatabaseHelper.COL_ID + "=?",
                    new String[]{String.valueOf(id)}
            );
            db.setTransactionSuccessful();
            return rows;
        } finally {
            db.endTransaction();
        }
    }

    private AnimalRecord fromCursor(Cursor cursor) {
        AnimalRecord record = new AnimalRecord();
        record.id = cursor.getLong(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ID));
        record.arete = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ARETE));
        record.especie = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ESPECIE));
        record.sexo = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_SEXO));
        record.fecha = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_FECHA));

        int pesoColumnIndex = cursor.getColumnIndex(DatabaseHelper.COL_PESO);
        if (pesoColumnIndex != -1 && !cursor.isNull(pesoColumnIndex)) {
            record.peso = cursor.getDouble(pesoColumnIndex);
        }

        int fotoColumnIndex = cursor.getColumnIndex(DatabaseHelper.COL_FOTO);
        if (fotoColumnIndex != -1 && !cursor.isNull(fotoColumnIndex)) {
            record.foto = cursor.getString(fotoColumnIndex);
        }

        int estadoColumnIndex = cursor.getColumnIndex(DatabaseHelper.COL_ESTADO);
        if (estadoColumnIndex != -1 && !cursor.isNull(estadoColumnIndex)) {
            record.estado = cursor.getString(estadoColumnIndex);
        } else {
            record.estado = "ACTIVO";
        }

        int fechaBajaColumnIndex = cursor.getColumnIndex(DatabaseHelper.COL_FECHA_BAJA);
        if (fechaBajaColumnIndex != -1 && !cursor.isNull(fechaBajaColumnIndex)) {
            record.fechaBaja = cursor.getString(fechaBajaColumnIndex);
        }

        int motivoBajaColumnIndex = cursor.getColumnIndex(DatabaseHelper.COL_MOTIVO_BAJA);
        if (motivoBajaColumnIndex != -1 && !cursor.isNull(motivoBajaColumnIndex)) {
            record.motivoBaja = cursor.getString(motivoBajaColumnIndex);
        }

        return record;
    }

    private void ensureAnimalesSchema(SQLiteDatabase db) {
        db.execSQL(DatabaseHelper.animalesDDL());

        boolean hasUpdatedAt = false;
        boolean hasEstado = false;
        boolean hasFechaBaja = false;
        boolean hasMotivoBaja = false;
        Cursor cursor = db.rawQuery("PRAGMA table_info(" + DatabaseHelper.TABLE_ANIMALES + ")", null);
        try {
            if (cursor.moveToFirst()) {
                do {
                    String name = cursor.getString(cursor.getColumnIndexOrThrow("name"));
                    if (DatabaseHelper.COL_UPDATED_AT.equals(name)) {
                        hasUpdatedAt = true;
                    }
                    if (DatabaseHelper.COL_ESTADO.equals(name)) {
                        hasEstado = true;
                    }
                    if (DatabaseHelper.COL_FECHA_BAJA.equals(name)) {
                        hasFechaBaja = true;
                    }
                    if (DatabaseHelper.COL_MOTIVO_BAJA.equals(name)) {
                        hasMotivoBaja = true;
                    }
                } while (cursor.moveToNext());
            }
        } finally {
            cursor.close();
        }

        if (!hasUpdatedAt) {
            db.execSQL(
                    "ALTER TABLE " + DatabaseHelper.TABLE_ANIMALES +
                            " ADD COLUMN " + DatabaseHelper.COL_UPDATED_AT + " TEXT"
            );
        }

        if (!hasEstado) {
            db.execSQL(
                    "ALTER TABLE " + DatabaseHelper.TABLE_ANIMALES +
                            " ADD COLUMN " + DatabaseHelper.COL_ESTADO + " TEXT DEFAULT 'ACTIVO'"
            );
        }

        if (!hasFechaBaja) {
            db.execSQL(
                    "ALTER TABLE " + DatabaseHelper.TABLE_ANIMALES +
                            " ADD COLUMN " + DatabaseHelper.COL_FECHA_BAJA + " TEXT"
            );
        }

        if (!hasMotivoBaja) {
            db.execSQL(
                    "ALTER TABLE " + DatabaseHelper.TABLE_ANIMALES +
                            " ADD COLUMN " + DatabaseHelper.COL_MOTIVO_BAJA + " TEXT"
            );
        }
    }

    public static class AnimalRecord {
        public long id;
        public String arete;
        public String especie;
        public String sexo;
        public String fecha;
        public Double peso;
        public String foto;
        public String estado;
        public String fechaBaja;
        public String motivoBaja;
    }
}
