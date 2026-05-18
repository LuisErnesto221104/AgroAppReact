package com.agroappreact.costs;

import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.text.TextUtils;

import androidx.annotation.Nullable;

import com.agroappreact.database.DatabaseHelper;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class CostosModule extends ReactContextBaseJavaModule {

    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    public CostosModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "CostosModule";
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private SQLiteDatabase db() {
        return DatabaseHelper.getInstance(getReactApplicationContext()).getReadableDatabase();
    }

    private WritableMap cursorToGasto(Cursor c) {
        WritableMap m = Arguments.createMap();
        m.putInt("id",          c.getInt(c.getColumnIndexOrThrow("id")));

        int idxAnimal = c.getColumnIndexOrThrow("animal_id");
        if (c.isNull(idxAnimal)) m.putNull("animalId");
        else                     m.putInt("animalId", c.getInt(idxAnimal));

        m.putDouble("monto",       c.getDouble(c.getColumnIndexOrThrow("monto")));
        m.putString("categoria",   c.getString(c.getColumnIndexOrThrow("categoria")));
        m.putString("descripcion", c.getString(c.getColumnIndexOrThrow("descripcion")));
        m.putString("fecha",       c.getString(c.getColumnIndexOrThrow("fecha")));

        int idxNotas = c.getColumnIndex("notas");
        if (idxNotas != -1 && !c.isNull(idxNotas)) m.putString("notas", c.getString(idxNotas));
        else                                         m.putNull("notas");

        return m;
    }

    private static final String BASE_SELECT =
        "SELECT id, animal_id, monto, categoria, descripcion, fecha, notas FROM gastos";

    // ── getGastos ────────────────────────────────────────────────────────────

    @ReactMethod
    public void getGastos(Promise promise) {
        executor.execute(() -> {
            try {
                Cursor c = db().rawQuery(BASE_SELECT + " ORDER BY fecha DESC", null);
                WritableArray arr = Arguments.createArray();
                try {
                    while (c.moveToNext()) arr.pushMap(cursorToGasto(c));
                } finally {
                    c.close();
                }
                promise.resolve(arr);
            } catch (Exception e) {
                promise.reject("DB_ERROR", e.getMessage(), e);
            }
        });
    }

    // ── getGastosByAnimal ────────────────────────────────────────────────────

    @ReactMethod
    public void getGastosByAnimal(double animalIdDouble, Promise promise) {
        executor.execute(() -> {
            try {
                int animalId = (int) animalIdDouble;
                Cursor c = db().rawQuery(
                    BASE_SELECT + " WHERE animal_id = ? ORDER BY fecha DESC",
                    new String[]{String.valueOf(animalId)}
                );
                WritableArray arr = Arguments.createArray();
                try {
                    while (c.moveToNext()) arr.pushMap(cursorToGasto(c));
                } finally {
                    c.close();
                }
                promise.resolve(arr);
            } catch (Exception e) {
                promise.reject("DB_ERROR", e.getMessage(), e);
            }
        });
    }

    // ── getGastosFiltrados ───────────────────────────────────────────────────

    @ReactMethod
    public void getGastosFiltrados(
        @Nullable String fechaDesde,
        @Nullable String fechaHasta,
        @Nullable String categoria,
        Promise promise) {

        executor.execute(() -> {
            try {
                StringBuilder q = new StringBuilder(BASE_SELECT + " WHERE 1=1");
                List<String> args = new ArrayList<>();

                if (!TextUtils.isEmpty(fechaDesde)) {
                    q.append(" AND fecha >= ?");
                    args.add(fechaDesde);
                }
                if (!TextUtils.isEmpty(fechaHasta)) {
                    q.append(" AND fecha <= ?");
                    args.add(fechaHasta);
                }
                if (!TextUtils.isEmpty(categoria)) {
                    q.append(" AND categoria = ?");
                    args.add(categoria);
                }
                q.append(" ORDER BY fecha DESC");

                Cursor c = db().rawQuery(q.toString(), args.toArray(new String[0]));
                WritableArray arr = Arguments.createArray();
                try {
                    while (c.moveToNext()) arr.pushMap(cursorToGasto(c));
                } finally {
                    c.close();
                }
                promise.resolve(arr);
            } catch (Exception e) {
                promise.reject("DB_ERROR", e.getMessage(), e);
            }
        });
    }
}
