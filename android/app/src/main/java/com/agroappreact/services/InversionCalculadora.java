package com.agroappreact.services;

import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import com.agroappreact.database.DatabaseHelper;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

public class InversionCalculadora {

    public static double calcularMargen(double inversion, double precioVenta) {
        return precioVenta - inversion;
    }

    /**
     * Calcula el margen real de un animal.
     * precio_compra se obtiene directamente de animales.precio_compra.
     * totalGastos es la suma de todos los gastos registrados para ese animal.
     */
    public static WritableMap getMargenRealAnimal(SQLiteDatabase db, long animalId) {
        WritableMap result = Arguments.createMap();
        try {
            // 1. Datos del animal
            Cursor animalCursor = db.query(
                DatabaseHelper.TABLE_ANIMALES,
                new String[]{
                    DatabaseHelper.COL_ANIMAL_ESTADO,
                    DatabaseHelper.COL_ANIMAL_PRECIO_COMPRA,
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

            String estado = animalCursor.getString(
                animalCursor.getColumnIndexOrThrow(DatabaseHelper.COL_ANIMAL_ESTADO));

            int colCompra = animalCursor.getColumnIndex(DatabaseHelper.COL_ANIMAL_PRECIO_COMPRA);
            double precioCompra = (colCompra != -1 && !animalCursor.isNull(colCompra))
                ? animalCursor.getDouble(colCompra) : 0;

            int colVenta = animalCursor.getColumnIndex(DatabaseHelper.COL_ANIMAL_PRECIO_VENTA);
            double precioVenta = (colVenta != -1 && !animalCursor.isNull(colVenta))
                ? animalCursor.getDouble(colVenta) : 0;

            int colFechaVenta = animalCursor.getColumnIndex(DatabaseHelper.COL_ANIMAL_FECHA_VENTA);
            String fechaVenta = (colFechaVenta != -1 && !animalCursor.isNull(colFechaVenta))
                ? animalCursor.getString(colFechaVenta) : null;

            animalCursor.close();

            // 2. Suma total de gastos registrados para este animal
            Cursor gastosCursor = db.rawQuery(
                "SELECT COALESCE(SUM(" + DatabaseHelper.COL_GASTO_MONTO + "), 0) AS total" +
                " FROM " + DatabaseHelper.TABLE_GASTOS +
                " WHERE " + DatabaseHelper.COL_GASTO_ANIMAL_ID + "=?",
                new String[]{String.valueOf(animalId)}
            );

            double sumaGastos = 0;
            if (gastosCursor.moveToFirst()) {
                sumaGastos = gastosCursor.getDouble(0);
            }
            gastosCursor.close();

            double inversionTotal = precioCompra + sumaGastos;
            double margen = calcularMargen(inversionTotal, precioVenta);
            boolean esGanancia = margen >= 0;
            double porcentaje = inversionTotal > 0
                ? (Math.abs(margen) / inversionTotal) * 100 : 0;

            result.putDouble("precioCompra", precioCompra);
            result.putDouble("sumaGastos", sumaGastos);
            result.putDouble("inversionTotal", inversionTotal);
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
