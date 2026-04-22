package com.agroappreact.animales;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.provider.MediaStore;

import androidx.core.content.FileProvider;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class AnimalCameraModule extends ReactContextBaseJavaModule {

    private static final int REQUEST_CODE_CAMERA = 4021;
    private static final int REQUEST_CODE_GALLERY = 4022;

    private final ReactApplicationContext reactContext;
    private Promise pendingPromise;
    private File pendingImageFile;
    private Uri pendingImageUri;

    private final ActivityEventListener activityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            if (requestCode != REQUEST_CODE_CAMERA && requestCode != REQUEST_CODE_GALLERY || pendingPromise == null) {
                return;
            }

            if (resultCode != Activity.RESULT_OK) {
                rejectPending(
                        requestCode == REQUEST_CODE_CAMERA ? "CAMERA_CANCELLED" : "GALLERY_CANCELLED",
                        requestCode == REQUEST_CODE_CAMERA
                                ? "La captura de fotografia fue cancelada."
                                : "La seleccion de imagen fue cancelada."
                );
                return;
            }

            if (requestCode == REQUEST_CODE_CAMERA && (pendingImageFile == null || pendingImageUri == null)) {
                rejectPending("CAMERA_ERROR", "No se pudo preparar la fotografia capturada.");
                return;
            }

            WritableMap result = Arguments.createMap();
            if (requestCode == REQUEST_CODE_CAMERA) {
                result.putString("uri", pendingImageUri.toString());
                result.putString("path", pendingImageFile.getAbsolutePath());
                result.putString("fileName", pendingImageFile.getName());
            } else {
                Uri selectedUri = data != null ? data.getData() : null;
                if (selectedUri == null) {
                    rejectPending("GALLERY_ERROR", "No se pudo leer la imagen seleccionada.");
                    return;
                }

                result.putString("uri", selectedUri.toString());
                result.putString("path", selectedUri.toString());
                result.putString("fileName", null);
            }
            pendingPromise.resolve(result);
            clearPending();
        }

        @Override
        public void onNewIntent(Intent intent) {
            // No-op.
        }
    };

    public AnimalCameraModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        reactContext.addActivityEventListener(activityEventListener);
    }

    @Override
    public String getName() {
        return "AnimalCameraModule";
    }

    @ReactMethod
    public void launchCamera(Promise promise) {
        if (pendingPromise != null) {
            promise.reject("CAMERA_BUSY", "Ya hay una captura de fotografia en proceso.");
            return;
        }

        Activity activity = getCurrentActivity();
        if (activity == null) {
            promise.reject("CAMERA_NO_ACTIVITY", "No hay una actividad activa para abrir la camara.");
            return;
        }

        try {
            File imageFile = createImageFile();
            Uri imageUri = FileProvider.getUriForFile(
                    reactContext,
                    reactContext.getPackageName() + ".fileprovider",
                    imageFile
            );

            Intent cameraIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
            cameraIntent.putExtra(MediaStore.EXTRA_OUTPUT, imageUri);
            cameraIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            cameraIntent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION);

            pendingPromise = promise;
            pendingImageFile = imageFile;
            pendingImageUri = imageUri;
            try {
                activity.startActivityForResult(cameraIntent, REQUEST_CODE_CAMERA);
            } catch (ActivityNotFoundException e) {
                clearPending();
                promise.reject("CAMERA_UNAVAILABLE", "No hay una app de camara disponible en el dispositivo.");
            }
        } catch (IOException e) {
            promise.reject("CAMERA_FILE_ERROR", "No se pudo preparar el archivo para la fotografia: " + e.getMessage());
        }
    }

    @ReactMethod
    public void launchGallery(Promise promise) {
        if (pendingPromise != null) {
            promise.reject("GALLERY_BUSY", "Ya hay una seleccion de imagen en proceso.");
            return;
        }

        Activity activity = getCurrentActivity();
        if (activity == null) {
            promise.reject("GALLERY_NO_ACTIVITY", "No hay una actividad activa para abrir la galeria.");
            return;
        }

        Intent galleryIntent = new Intent(Intent.ACTION_GET_CONTENT);
        galleryIntent.setType("image/*");
        galleryIntent.addCategory(Intent.CATEGORY_OPENABLE);

        pendingPromise = promise;
        pendingImageFile = null;
        pendingImageUri = null;

        try {
            activity.startActivityForResult(Intent.createChooser(galleryIntent, "Seleccionar imagen"), REQUEST_CODE_GALLERY);
        } catch (ActivityNotFoundException e) {
            clearPending();
            promise.reject("GALLERY_UNAVAILABLE", "No hay una app para seleccionar imagenes en el dispositivo.");
        }
    }

    @Override
    public void invalidate() {
        clearPending();
        super.invalidate();
    }

    private File createImageFile() throws IOException {
        File picturesDir = new File(reactContext.getCacheDir(), "fotos/animales_tmp");
        if (!picturesDir.exists() && !picturesDir.mkdirs()) {
            throw new IOException("No se pudo crear la carpeta temporal de fotografia.");
        }

        String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(new Date());
        return File.createTempFile("animal_" + timestamp + "_", ".jpg", picturesDir);
    }

    private void rejectPending(String code, String message) {
        if (pendingPromise != null) {
            pendingPromise.reject(code, message);
        }
        clearPending();
    }

    private void clearPending() {
        pendingPromise = null;
        pendingImageFile = null;
        pendingImageUri = null;
    }
}