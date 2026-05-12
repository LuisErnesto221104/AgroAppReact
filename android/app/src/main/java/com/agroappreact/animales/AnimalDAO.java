package com.agroappreact.animales;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteException;

import com.agroappreact.database.DatabaseHelper;

import java.util.ArrayList;
import java.util.List;

public class AnimalDAO {

    private final com.agroappreact.database.DatabaseHelper dbHelper;

    public AnimalDAO(com.agroappreact.database.DatabaseHelper dbHelper) {
        this.dbHelper = dbHelper;
    }

    public long insertAnimal(String arete, String especie, String sexo, String fecha, Double peso, String fotoPath, Double precioCompra) {
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
            if (precioCompra != null) {
                values.put(DatabaseHelper.COL_ANIMAL_PRECIO_COMPRA, precioCompra);
            } else {
                values.put(DatabaseHelper.COL_ANIMAL_PRECIO_COMPRA, 0.0);
            }

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

    public List<AnimalRecord> buscarPorAreteYEstado(String termino, String estado) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        ensureAnimalesSchema(db);

        String normalizedTermino = termino == null ? "" : termino.trim();
        List<AnimalRecord> animals = new ArrayList<>();
        Cursor cursor = db.rawQuery(
                "SELECT * FROM " + DatabaseHelper.TABLE_ANIMALES +
                        " WHERE " + DatabaseHelper.COL_ARETE + " LIKE '%'||?||'%'" +
                        " AND " + DatabaseHelper.COL_ESTADO + "=?" +
                        " ORDER BY " + DatabaseHelper.COL_ID + " DESC",
                new String[]{normalizedTermino, estado}
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

    public List<PesoRecord> getHistorialPeso(long animalId, int limit) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        ensureAnimalesSchema(db);
        ensureHistorialResumenSchema(db);

        int safeLimit = limit <= 0 ? 10 : limit;
        List<PesoRecord> historial = new ArrayList<>();
        Cursor cursor = db.rawQuery(
                "SELECT fecha, peso FROM historial_peso WHERE animal_id=? ORDER BY fecha DESC LIMIT " + safeLimit,
                new String[]{String.valueOf(animalId)}
        );

        try {
            if (cursor != null && cursor.moveToFirst()) {
                do {
                    PesoRecord record = new PesoRecord();
                    record.fecha = cursor.getString(cursor.getColumnIndexOrThrow("fecha"));
                    record.peso = cursor.getDouble(cursor.getColumnIndexOrThrow("peso"));
                    historial.add(record);
                } while (cursor.moveToNext());
            }
            return historial;
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
    }

    public List<EventoRecord> getEventosRecientes(long animalId, int limit) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        ensureAnimalesSchema(db);
        ensureHistorialResumenSchema(db);

        int safeLimit = limit <= 0 ? 10 : limit;
        List<EventoRecord> eventos = new ArrayList<>();
        Cursor cursor = db.rawQuery(
                "SELECT id, fecha, enfermedad, sintomas, tratamiento, estado, observaciones " +
                        "FROM historial_clinico WHERE animal_id=? ORDER BY fecha DESC LIMIT " + safeLimit,
                new String[]{String.valueOf(animalId)}
        );

        try {
            if (cursor != null && cursor.moveToFirst()) {
                do {
                    EventoRecord record = new EventoRecord();
                    record.id = cursor.getLong(cursor.getColumnIndexOrThrow("id"));
                    record.fecha = cursor.getString(cursor.getColumnIndexOrThrow("fecha"));
                    record.enfermedad = cursor.getString(cursor.getColumnIndexOrThrow("enfermedad"));
                    record.sintomas = cursor.getString(cursor.getColumnIndexOrThrow("sintomas"));
                    record.tratamiento = cursor.getString(cursor.getColumnIndexOrThrow("tratamiento"));
                    record.estado = cursor.getString(cursor.getColumnIndexOrThrow("estado"));
                    record.observaciones = cursor.getString(cursor.getColumnIndexOrThrow("observaciones"));
                    eventos.add(record);
                } while (cursor.moveToNext());
            }
            return eventos;
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

    // Sprint 3 — RF002: Sobrecarga para manejar VENDIDO con precio y fecha de venta
    public int changeEstado(long id, String estado, String fechaBaja, String motivoBaja, String updatedAt, Double precioVenta, String fechaVenta) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        db.beginTransaction();
        try {
            ensureAnimalesSchema(db);

            ContentValues values = new ContentValues();
            values.put(DatabaseHelper.COL_ESTADO, estado);
            values.put(DatabaseHelper.COL_FECHA_BAJA, fechaBaja);
            values.put(DatabaseHelper.COL_MOTIVO_BAJA, motivoBaja);
            values.put(DatabaseHelper.COL_UPDATED_AT, updatedAt);
            
            if ("VENDIDO".equals(estado) && precioVenta != null && fechaVenta != null) {
                values.put(DatabaseHelper.COL_PRECIO_VENTA, precioVenta);
                values.put(DatabaseHelper.COL_FECHA_VENTA, fechaVenta);
            }

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

        int precioCompraIdx = cursor.getColumnIndex(DatabaseHelper.COL_ANIMAL_PRECIO_COMPRA);
        if (precioCompraIdx != -1 && !cursor.isNull(precioCompraIdx)) {
            record.precioCompra = cursor.getDouble(precioCompraIdx);
        }

        return record;
    }

    private void ensureAnimalesSchema(SQLiteDatabase db) {
        db.execSQL(DatabaseHelper.animalesDDL());

        boolean hasUpdatedAt = false;
        boolean hasEstado = false;
        boolean hasFechaBaja = false;
        boolean hasMotivoBaja = false;
        boolean hasPrecioCompra = false;
        Cursor cursor = db.rawQuery("PRAGMA table_info(" + DatabaseHelper.TABLE_ANIMALES + ")", null);
        try {
            if (cursor.moveToFirst()) {
                do {
                    String name = cursor.getString(cursor.getColumnIndexOrThrow("name"));
                    if (DatabaseHelper.COL_UPDATED_AT.equals(name)) hasUpdatedAt = true;
                    if (DatabaseHelper.COL_ESTADO.equals(name)) hasEstado = true;
                    if (DatabaseHelper.COL_FECHA_BAJA.equals(name)) hasFechaBaja = true;
                    if (DatabaseHelper.COL_MOTIVO_BAJA.equals(name)) hasMotivoBaja = true;
                    if (DatabaseHelper.COL_ANIMAL_PRECIO_COMPRA.equals(name)) hasPrecioCompra = true;
                } while (cursor.moveToNext());
            }
        } finally {
            cursor.close();
        }

        if (!hasUpdatedAt) {
            db.execSQL("ALTER TABLE " + DatabaseHelper.TABLE_ANIMALES +
                    " ADD COLUMN " + DatabaseHelper.COL_UPDATED_AT + " TEXT");
        }
        if (!hasEstado) {
            db.execSQL("ALTER TABLE " + DatabaseHelper.TABLE_ANIMALES +
                    " ADD COLUMN " + DatabaseHelper.COL_ESTADO + " TEXT DEFAULT 'ACTIVO'");
        }
        if (!hasFechaBaja) {
            db.execSQL("ALTER TABLE " + DatabaseHelper.TABLE_ANIMALES +
                    " ADD COLUMN " + DatabaseHelper.COL_FECHA_BAJA + " TEXT");
        }
        if (!hasMotivoBaja) {
            db.execSQL("ALTER TABLE " + DatabaseHelper.TABLE_ANIMALES +
                    " ADD COLUMN " + DatabaseHelper.COL_MOTIVO_BAJA + " TEXT");
        }
        if (!hasPrecioCompra) {
            db.execSQL("ALTER TABLE " + DatabaseHelper.TABLE_ANIMALES +
                    " ADD COLUMN " + DatabaseHelper.COL_ANIMAL_PRECIO_COMPRA + " REAL DEFAULT 0");
        }

        db.execSQL(DatabaseHelper.areteIndexDDL());
    }

    private void ensureHistorialResumenSchema(SQLiteDatabase db) {
        db.execSQL(
                "CREATE TABLE IF NOT EXISTS historial_peso (" +
                        "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                        "animal_id INTEGER NOT NULL, " +
                        "fecha TEXT NOT NULL, " +
                        "peso REAL NOT NULL, " +
                        "observaciones TEXT, " +
                        "FOREIGN KEY(animal_id) REFERENCES " + DatabaseHelper.TABLE_ANIMALES + "(" + DatabaseHelper.COL_ID + ") ON DELETE CASCADE" +
                        ")"
        );
        db.execSQL("CREATE INDEX IF NOT EXISTS idx_historial_peso_animal_fecha ON historial_peso(animal_id, fecha DESC)");

        db.execSQL(
                "CREATE TABLE IF NOT EXISTS historial_clinico (" +
                        "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                        "animal_id INTEGER NOT NULL, " +
                        "fecha TEXT, " +
                        "enfermedad TEXT, " +
                        "sintomas TEXT, " +
                        "tratamiento TEXT, " +
                        "estado TEXT, " +
                        "observaciones TEXT, " +
                        "FOREIGN KEY(animal_id) REFERENCES " + DatabaseHelper.TABLE_ANIMALES + "(" + DatabaseHelper.COL_ID + ") ON DELETE CASCADE" +
                        ")"
        );
        db.execSQL("CREATE INDEX IF NOT EXISTS idx_historial_clinico_animal_fecha ON historial_clinico(animal_id, fecha DESC)");
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
        public Double precioCompra;
    }

    public static class PesoRecord {
        public String fecha;
        public double peso;
    }

    public static class EventoRecord {
        public long id;
        public String fecha;
        public String enfermedad;
        public String sintomas;
        public String tratamiento;
        public String estado;
        public String observaciones;
    }
}
