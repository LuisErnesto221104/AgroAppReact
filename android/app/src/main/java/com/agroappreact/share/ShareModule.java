package com.agroappreact.share;

import android.app.Activity;
import android.content.ClipData;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;

import androidx.core.content.FileProvider;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;

public class ShareModule extends ReactContextBaseJavaModule {

    public ShareModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "AgroShareModule";
    }

    @ReactMethod
    public void sharePdf(String filePath, String title, Promise promise) {
        try {
            File file = new File(filePath);
            if (!file.exists()) {
                promise.reject("FILE_NOT_FOUND", "PDF no encontrado: " + filePath);
                return;
            }

            Activity activity = getCurrentActivity();
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Sin actividad disponible");
                return;
            }

            // Android 10+: insertar en MediaStore Downloads para obtener una URI
            // pública que cualquier app pueda leer sin permisos de FileProvider.
            // Android 7-9: FileProvider es suficiente (las apps aún leen content://).
            Uri shareUri;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                shareUri = copiarAMediaStore(file);
            } else {
                shareUri = FileProvider.getUriForFile(
                    getReactApplicationContext(),
                    "com.agroappreact.fileprovider",
                    file
                );
            }

            Intent intent = new Intent(Intent.ACTION_SEND);
            intent.setType("application/pdf");
            intent.putExtra(Intent.EXTRA_STREAM, shareUri);
            intent.putExtra(Intent.EXTRA_SUBJECT, title);
            intent.putExtra(Intent.EXTRA_TEXT, title);

            // ClipData necesario para que el sistema propague permisos en el chooser
            intent.setClipData(ClipData.newRawUri(title, shareUri));
            intent.addFlags(
                Intent.FLAG_GRANT_READ_URI_PERMISSION |
                Intent.FLAG_GRANT_WRITE_URI_PERMISSION
            );

            activity.startActivity(Intent.createChooser(intent, "Compartir PDF via..."));
            promise.resolve(filePath);

        } catch (Exception e) {
            promise.reject("SHARE_ERROR", e.getMessage(), e);
        }
    }

    // Inserta el PDF en la carpeta pública Downloads del sistema (Android 10+).
    // La URI devuelta es accesible por cualquier app sin permisos adicionales.
    private Uri copiarAMediaStore(File file) throws Exception {
        ContentResolver resolver = getReactApplicationContext().getContentResolver();

        ContentValues values = new ContentValues();
        values.put(MediaStore.Downloads.DISPLAY_NAME, file.getName());
        values.put(MediaStore.Downloads.MIME_TYPE, "application/pdf");
        values.put(MediaStore.Downloads.RELATIVE_PATH,
            android.os.Environment.DIRECTORY_DOWNLOADS + "/AgroApp");
        values.put(MediaStore.Downloads.IS_PENDING, 1);

        Uri collection = MediaStore.Downloads.EXTERNAL_CONTENT_URI;
        Uri itemUri = resolver.insert(collection, values);
        if (itemUri == null) {
            throw new Exception("No se pudo crear entrada en MediaStore Downloads");
        }

        try (OutputStream os = resolver.openOutputStream(itemUri);
             InputStream  is = new FileInputStream(file)) {
            if (os == null) throw new Exception("OutputStream de MediaStore es nulo");
            byte[] buf = new byte[8192];
            int len;
            while ((len = is.read(buf)) > 0) {
                os.write(buf, 0, len);
            }
        }

        // Marcar el archivo como listo para que otras apps lo vean
        values.clear();
        values.put(MediaStore.Downloads.IS_PENDING, 0);
        resolver.update(itemUri, values, null, null);

        return itemUri;
    }
}
