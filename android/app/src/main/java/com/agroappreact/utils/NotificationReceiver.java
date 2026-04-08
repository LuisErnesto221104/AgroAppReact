package com.agroappreact.utils;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import com.agroappreact.MainActivity;
import com.agroappreact.R;

public class NotificationReceiver extends BroadcastReceiver {
    
    private static final String CHANNEL_ID = "agroapp_channel";
    private static final String CHANNEL_NAME = "AgroApp Recordatorios";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        String titulo = intent.getStringExtra("titulo");
        String mensaje = intent.getStringExtra("mensaje");
        int eventoId = intent.getIntExtra("eventoId", 0);
        
        crearCanalNotificacion(context);
        mostrarNotificacion(context, titulo, mensaje, eventoId);
    }
    
    private void crearCanalNotificacion(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Notificaciones de eventos sanitarios");
            
            NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }
    
    private void mostrarNotificacion(Context context, String titulo, String mensaje, int eventoId) {
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            context,
            eventoId,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(titulo)
            .setContentText(mensaje)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true);
        
        NotificationManager notificationManager = 
            (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        
        if (notificationManager != null) {
            notificationManager.notify(eventoId, builder.build());
        }
    }
}
