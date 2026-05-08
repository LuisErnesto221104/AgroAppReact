package com.agroappreact.services;

import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import com.agroappreact.database.DatabaseHelper;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

/**
 * Sprint 3 — RF002: Cálculo de inversión y margen para animales
 */
public class InversionCalculadora {

    public static WritableMap getMargenRealAnimal(SQLiteDatabase db, long animalId) {
        WritableMap result = Arguments.createMap();

        try {
            // Obtener datos básicos del animal
            Cursor animalCursor = db.query(
                    DatabaseHelper.TABLE_ANIMALES,
                    new String[]{
                            DatabaseHelper.COL_ANIMAL_ID,
                            DatabaseHelper.COL_ANIMAL_ARETE,
                            DatabaseHelper.COL_ANIMAL_ESTADO,
                            DatabaseHelper.COL_ANIMAL_PRECIO_VENTA,
                            DatabaseHelper.COL_ANIMAL_FECHA_VENTA
                    },
                    DatabaseHelper.COL_ANIMAL_ID + "=?",
                    new String[]{String.valueOf(animalId)},
                    null, null, null
            );

            if (!animalCursor.moveToFirst()) {
                animalCursor.close();
                result.putBoolean("estaVendido", false);
                result.putString("error", "Animal no encontrado");
                return result;
            }

            String estado = animalCursor.getString(animalCursor.getColumnIndexOrThrow(DatabaseHelper.COL_ANIMAL_ESTADO));
            int estadoColumn = animalCursor.getColumnIndex(DatabaseHelper.COL_ANIMAL_PRECIO_VENTA);
            int fechaVentaColumn = animalCursor.getColumnIndex(DatabaseHelper.COL_ANIMAL_FECHA_VENTA);

            double precioVenta = 0;
            String fechaVenta = null;

            if (estadoColumn != -1 && !animalCursor.isNull(estadoColumn)) {
                precioVenta = animalCursor.getDouble(estadoColumn);
            }

            if (fechaVentaColumn != -1 && !animalCursor.isNull(fechaVentaColumn)) {
                fechaVenta = animalCursor.getString(fechaVentaColumn);
            }

            animalCursor.close();

            // Calcular inversión total (compra + gastos sanitarios y de alimentación)
            Cursor inversionCursor = db.rawQuery(
                    "SELECT " +
                            "COALESCE(MAX(CASE WHEN " + DatabaseHelper.COL_GASTO_TIPO + "='COMPRA' THEN " + DatabaseHelper.COL_GASTO_MONTO + " ELSE 0 END), 0) as compra, " +
                            "COALESCE(SUM(CASE WHEN " + DatabaseHelper.COL_GASTO_TIPO + " IN ('SANITARIO', 'ALIMENTACION') THEN " + DatabaseHelper.COL_GASTO_MONTO + " ELSE 0 END), 0) as gastos " +
                            "FROM " + DatabaseHelper.TABLE_GASTOS + " WHERE " + DatabaseHelper.COL_GASTO_ANIMAL_ID + " = ?",
                    new String[]{String.valueOf(animalId)}
            );

            double precioCompra = 0;
            double sumaGastos = 0;

            if (inversionCursor.moveToFirst()) {
                precioCompra = inversionCursor.getDouble(0);
                sumaGastos = inversionCursor.getDouble(1);
            }

            inversionCursor.close();

            double inversionTotal = precioCompra + sumaGastos;
            boolean esGanancia = precioVenta > inversionTotal;
            double margen = Math.abs(precioVenta - inversionTotal);
            double porcentaje = inversionTotal > 0 ? (margen / inversionTotal) * 100 : 0;

            result.putDouble("inversionTotal", inversionTotal);
            result.putDouble("precioCompra", precioCompra);
            result.putDouble("sumaGastos", sumaGastos);
            result.putDouble("precioVenta", precioVenta);
            result.putDouble("margen", margen);
            result.putDouble("porcentaje", porcentaje);
            result.putBoolean("esGanancia", esGanancia);
            result.putBoolean("estaVendido", "VENDIDO".equals(estado));
            if (fechaVenta != null) {
                result.putString("fechaVenta", fechaVenta);
            }

            return result;
        } catch (Exception e) {
            result.putString("error", e.getMessage());
            return result;
        }
    }
}
