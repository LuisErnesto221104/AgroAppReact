package com.agroappreact.bridge;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import androidx.annotation.NonNull;
import androidx.work.Constraints;
import androidx.work.Data;
import androidx.work.ExistingWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.OneTimeWorkRequest;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

public class NotificationNativeModule extends ReactContextBaseJavaModule {

    private static final String ISO_PATTERN = "yyyy-MM-dd";

    public NotificationNativeModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "NotificationNativeModule";
    }

    @ReactMethod
    public void programarAlarma(int animalId, String fechaISO, String titulo, String descripcion, Promise promise) {
        try {
            long triggerAtMillis = resolveTriggerAtMillis(fechaISO);
            long now = System.currentTimeMillis();
            if (triggerAtMillis <= now) {
                triggerAtMillis = now + TimeUnit.MINUTES.toMillis(1);
            }

            int requestCode = buildRequestCode(animalId, fechaISO);
            PendingIntent pendingIntent = buildPendingIntent(requestCode, titulo, descripcion);

            AlarmManager alarmManager = (AlarmManager) getReactApplicationContext().getSystemService(Context.ALARM_SERVICE);
            if (alarmManager == null) {
                throw new IllegalStateException("AlarmManager no disponible.");
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
            } else {
                alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
            }

            WritableMap result = Arguments.createMap();
            result.putBoolean("ok", true);
            result.putInt("alarmId", requestCode);
            result.putDouble("triggerAtMillis", (double) triggerAtMillis);
            promise.resolve(result);
        } catch (SecurityException secEx) {
            try {
                int fallbackId = buildRequestCode(animalId, fechaISO);
                enqueueFallbackWorker(fallbackId, fechaISO, titulo, descripcion);

                WritableMap result = Arguments.createMap();
                result.putBoolean("ok", true);
                result.putInt("alarmId", fallbackId);
                result.putString("mode", "workmanager-fallback");
                promise.resolve(result);
            } catch (Exception inner) {
                promise.reject("ERR_PROGRAMAR_ALARMA", inner.getMessage(), inner);
            }
        } catch (Exception e) {
            promise.reject("ERR_PROGRAMAR_ALARMA", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void cancelarAlarma(int requestCode, Promise promise) {
        try {
            AlarmManager alarmManager = (AlarmManager) getReactApplicationContext().getSystemService(Context.ALARM_SERVICE);
            PendingIntent pendingIntent = buildPendingIntent(requestCode, null, null);

            if (alarmManager != null) {
                alarmManager.cancel(pendingIntent);
            }
            pendingIntent.cancel();

            WorkManager.getInstance(getReactApplicationContext())
                .cancelUniqueWork(uniqueWorkName(requestCode));

            WritableMap result = Arguments.createMap();
            result.putBoolean("ok", true);
            result.putInt("alarmId", requestCode);
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("ERR_CANCELAR_ALARMA", e.getMessage(), e);
        }
    }

    private PendingIntent buildPendingIntent(int requestCode, String titulo, String descripcion) {
        Intent intent = new Intent(getReactApplicationContext(), AlarmReceiver.class);
        intent.putExtra(AlarmReceiver.EXTRA_ALARM_ID, requestCode);
        if (titulo != null) {
            intent.putExtra(AlarmReceiver.EXTRA_TITLE, titulo);
        }
        if (descripcion != null) {
            intent.putExtra(AlarmReceiver.EXTRA_DESCRIPTION, descripcion);
        }

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }

        return PendingIntent.getBroadcast(getReactApplicationContext(), requestCode, intent, flags);
    }

    private int buildRequestCode(int animalId, String fechaISO) {
        String seed = animalId + "|" + fechaISO;
        return Math.abs(seed.hashCode());
    }

    private void enqueueFallbackWorker(int requestCode, String fechaISO, String titulo, String descripcion) {
        long triggerAtMillis = resolveTriggerAtMillis(fechaISO);
        long now = System.currentTimeMillis();
        long delayMs = Math.max(TimeUnit.MINUTES.toMillis(1), triggerAtMillis - now);

        Data inputData = new Data.Builder()
            .putInt(AlarmReceiver.EXTRA_ALARM_ID, requestCode)
            .putString(AlarmReceiver.EXTRA_TITLE, titulo)
            .putString(AlarmReceiver.EXTRA_DESCRIPTION, descripcion)
            .build();

        Constraints constraints = new Constraints.Builder()
            .setRequiredNetworkType(NetworkType.NOT_REQUIRED)
            .build();

        OneTimeWorkRequest request = new OneTimeWorkRequest.Builder(SanitarioNotificationWorker.class)
            .setInitialDelay(delayMs, TimeUnit.MILLISECONDS)
            .setInputData(inputData)
            .setConstraints(constraints)
            .build();

        WorkManager.getInstance(getReactApplicationContext()).enqueueUniqueWork(
            uniqueWorkName(requestCode),
            ExistingWorkPolicy.REPLACE,
            request
        );
    }

    private String uniqueWorkName(int requestCode) {
        return "sanitario-alarm-" + requestCode;
    }

    private long resolveTriggerAtMillis(String fechaISO) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat(ISO_PATTERN, Locale.US);
            sdf.setLenient(false);
            Date parsed = sdf.parse(fechaISO);
            if (parsed == null) {
                throw new IllegalArgumentException("Fecha invalida.");
            }

            Calendar calendar = Calendar.getInstance();
            calendar.setTime(parsed);
            calendar.set(Calendar.HOUR_OF_DAY, 9);
            calendar.set(Calendar.MINUTE, 0);
            calendar.set(Calendar.SECOND, 0);
            calendar.set(Calendar.MILLISECOND, 0);
            return calendar.getTimeInMillis();
        } catch (ParseException e) {
            throw new IllegalArgumentException("fechaISO invalida. Formato esperado yyyy-MM-dd");
        }
    }

    public static class SanitarioNotificationWorker extends Worker {

        public SanitarioNotificationWorker(@NonNull Context context, @NonNull WorkerParameters workerParams) {
            super(context, workerParams);
        }

        @NonNull
        @Override
        public Result doWork() {
            int alarmId = getInputData().getInt(AlarmReceiver.EXTRA_ALARM_ID, (int) System.currentTimeMillis());
            String title = getInputData().getString(AlarmReceiver.EXTRA_TITLE);
            String description = getInputData().getString(AlarmReceiver.EXTRA_DESCRIPTION);

            Intent intent = new Intent(getApplicationContext(), AlarmReceiver.class);
            intent.putExtra(AlarmReceiver.EXTRA_ALARM_ID, alarmId);
            intent.putExtra(AlarmReceiver.EXTRA_TITLE, title);
            intent.putExtra(AlarmReceiver.EXTRA_DESCRIPTION, description);

            new AlarmReceiver().onReceive(getApplicationContext(), intent);
            return Result.success();
        }
    }
}
