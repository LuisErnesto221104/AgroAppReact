package com.agroappreact.services;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

public class SanitarioCicloNOM041 {

    public enum CicloNOM041 {
        VACUNA_AFTOSA(6),
        VACUNA_BRUCELOSIS(12),
        DESPARASITACION_INTERNA(3),
        DESPARASITACION_EXTERNA(2);

        private final int meses;

        CicloNOM041(int meses) {
            this.meses = meses;
        }

        public int getMeses() {
            return meses;
        }
    }

    /**
     * Calcula la próxima fecha de evento sanitario según normas NOM-041
     *
     * @param tipoEvento "VACUNA" o "DESPARASITACION"
     * @param subtipo "AFTOSA", "BRUCELOSIS", "INTERNA", "EXTERNA"
     * @param fechaISO fecha en formato YYYY-MM-DD
     * @return próxima fecha en formato YYYY-MM-DD, o null si combinación desconocida
     */
    public static String calcularProximaFecha(String tipoEvento, String subtipo, String fechaISO) {
        try {
            if (tipoEvento == null || subtipo == null || fechaISO == null) {
                return null;
            }

            // Construir la clave del ciclo
            String cicloKey = tipoEvento.toUpperCase() + "_" + subtipo.toUpperCase();

            CicloNOM041 ciclo;
            try {
                ciclo = CicloNOM041.valueOf(cicloKey);
            } catch (IllegalArgumentException e) {
                return null; // Combinación desconocida
            }

            // Parsear fecha ISO
            SimpleDateFormat isoFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(isoFormat.parse(fechaISO));

            // Agregar meses según ciclo
            calendar.add(Calendar.MONTH, ciclo.getMeses());

            // Retornar en formato ISO
            return isoFormat.format(calendar.getTime());
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
