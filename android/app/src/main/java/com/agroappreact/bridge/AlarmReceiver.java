package com.agroappreact.bridge;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.agroappreact.R;

public class AlarmReceiver extends BroadcastReceiver {

    public static final String CHANNEL_ID = "sanitario";
    public static final String EXTRA_ALARM_ID = "alarmId";
    public static final String EXTRA_TITLE = "title";
    public static final String EXTRA_DESCRIPTION = "description";

    @Override
    public void onReceive(Context context, Intent intent) {
        String title = intent != null ? intent.getStringExtra(EXTRA_TITLE) : null;
        String description = intent != null ? intent.getStringExtra(EXTRA_DESCRIPTION) : null;
        int alarmId = intent != null ? intent.getIntExtra(EXTRA_ALARM_ID, (int) System.currentTimeMillis()) : (int) System.currentTimeMillis();

        if (title == null || title.trim().isEmpty()) {
            title = "Recordatorio sanitario";
        }
        if (description == null || description.trim().isEmpty()) {
            description = "Tienes un evento sanitario programado.";
        }

        createChannelIfNeeded(context);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(description)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(description))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setColor(Color.parseColor("#07612d"))
            .setAutoCancel(true)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .setVibrate(new long[]{0, 350, 220, 350});

        NotificationManagerCompat.from(context).notify(alarmId, builder.build());
    }

    private void createChannelIfNeeded(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }

        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null) {
            return;
        }

        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Sanitario",
            NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("Recordatorios de eventos sanitarios");
        channel.enableVibration(true);
        channel.enableLights(true);
        channel.setLightColor(Color.parseColor("#07612d"));
        manager.createNotificationChannel(channel);
    }
}
