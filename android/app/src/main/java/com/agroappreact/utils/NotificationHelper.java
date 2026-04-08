package com.agroappreact.utils;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import com.agroappreact.models.EventoSanitario;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

public class NotificationHelper {

    public static void programarNotificacion(Context context, EventoSanitario evento) {
        if (evento.getRecordatorio() != 1) {
            return;
        }

        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy", Locale.getDefault());
        Calendar calendar = Calendar.getInstance();
        try {
            calendar.setTime(sdf.parse(evento.getFechaProgramada()));
        } catch (Exception e) {
            e.printStackTrace();
            return;
        }
        
        programarNotificacionIndividual(context, evento, calendar, -3, "🔔 Recordatorio: ");
        programarNotificacionIndividual(context, evento, calendar, -1, "⚠️ Recordatorio urgente: ");
        programarNotificacionIndividual(context, evento, calendar, 0, "🚨 ¡HOY! ");
    }

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
        
        int requestCode = evento.getId() * 100 + (diasOffset + 10);
        
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            flags
        );

        Calendar calendar = (Calendar) fechaEvento.clone();
        calendar.add(Calendar.DAY_OF_MONTH, diasOffset);
        
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

        if (triggerTime > currentTime && alarmManager != null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
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

    public static void cancelarNotificacion(Context context, int eventoId) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        
        int[] offsets = {-3, -1, 0};
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

    public static void reprogramarNotificacion(Context context, EventoSanitario evento) {
        cancelarNotificacion(context, evento.getId());
        programarNotificacion(context, evento);
    }
}
