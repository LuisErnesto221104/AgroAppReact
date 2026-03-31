package com.example.agroappreact.dao;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import com.example.agroapp.models.EventoSanitario;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

public class NotificationHelper {

    /**
     * Programa TRES notificaciones para un evento sanitario según RF009:
     * - 3 días antes a las 9:00 AM
     * - 1 día antes a las 9:00 AM  
     * - El mismo día a las 9:00 AM
     * 
     * @param context Contexto de la aplicación
     * @param evento EventoSanitario para el cual programar las notificaciones
     */
    public static void programarNotificacion(Context context, EventoSanitario evento) {
        if (evento.getRecordatorio() != 1) {
            return; // No programar si el recordatorio está desactivado
        }

        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy", Locale.getDefault());
        Calendar calendar = Calendar.getInstance();
        try {
            calendar.setTime(sdf.parse(evento.getFechaProgramada()));
        } catch (Exception e) {
            e.printStackTrace();
            return;
        }
        
        // Programar 3 notificaciones según RF009
        programarNotificacionIndividual(context, evento, calendar, -3, "🔔 Recordatorio: "); // 3 días antes
        programarNotificacionIndividual(context, evento, calendar, -1, "⚠️ Recordatorio urgente: "); // 1 día antes
        programarNotificacionIndividual(context, evento, calendar, 0, "🚨 ¡HOY! "); // El mismo día
    }

    /**
     * Programa una notificación individual con un offset de días
     * 
     * @param context Contexto de la aplicación
     * @param evento Evento sanitario
     * @param fechaEvento Fecha del evento
     * @param diasOffset Días antes del evento (-3, -1, 0)
     * @param prefijo Prefijo para el título de la notificación
     */
    private static void programarNotificacionIndividual(Context context, EventoSanitario evento, 
                                                        Calendar fechaEvento, int diasOffset, String prefijo) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        
        Intent intent = new Intent(context, NotificationReceiver.class);
        intent.putExtra("titulo", prefijo + evento.getTipo());
        intent.putExtra("mensaje", evento.getDescripcion());
        intent.putExtra("eventoId", evento.getId());
        
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        
        // Usar un request code único para cada notificación (eventoId * 100 + offset)
        // +10 para evitar valores negativos en el request code
        int requestCode = evento.getId() * 100 + (diasOffset + 10);
        
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            flags
        );

        Calendar calendar = (Calendar) fechaEvento.clone();
        calendar.add(Calendar.DAY_OF_MONTH, diasOffset);
        
        // Usar la hora del recordatorio del evento, o 9:00 AM por defecto
        String horaRecordatorio = evento.getHoraRecordatorio();
        int hora = 9;
        int minuto = 0;
        if (horaRecordatorio != null && horaRecordatorio.contains(":")) {
            try {
                String[] partes = horaRecordatorio.split(":");
                hora = Integer.parseInt(partes[0]);
                minuto = Integer.parseInt(partes[1]);
            } catch (NumberFormatException e) {
                hora = 9;
                minuto = 0;
            }
        }
        calendar.set(Calendar.HOUR_OF_DAY, hora);
        calendar.set(Calendar.MINUTE, minuto);
        calendar.set(Calendar.SECOND, 0);

        long triggerTime = calendar.getTimeInMillis();
        long currentTime = System.currentTimeMillis();

        // Solo programar si la fecha está en el futuro
        if (triggerTime > currentTime && alarmManager != null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                // Para Android 6.0+, usar setExactAndAllowWhileIdle para mayor precisión
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerTime,
                    pendingIntent
                );
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    triggerTime,
                    pendingIntent
                );
            }
        }
    }

    /**
     * Cancela las 3 notificaciones programadas para un evento (RF009)
     * 
     * @param context Contexto de la aplicación
     * @param eventoId ID del evento sanitario
     */
    public static void cancelarNotificacion(Context context, int eventoId) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        
        // Cancelar las 3 notificaciones (3 días antes, 1 día antes, mismo día)
        int[] offsets = {-3, -1, 0}; // Días antes del evento
        for (int offset : offsets) {
            Intent intent = new Intent(context, NotificationReceiver.class);
            int requestCode = eventoId * 100 + (offset + 10);
            
            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context,
                requestCode,
                intent,
                flags
            );
            
            if (alarmManager != null) {
                alarmManager.cancel(pendingIntent);
            }
            pendingIntent.cancel();
        }
    }

    /**
     * Reprograma una notificación (útil al actualizar un evento)
     * @param context Contexto de la aplicación
     * @param evento EventoSanitario actualizado
     */
    public static void reprogramarNotificacion(Context context, EventoSanitario evento) {
        cancelarNotificacion(context, evento.getId());
        programarNotificacion(context, evento);
    }
}
