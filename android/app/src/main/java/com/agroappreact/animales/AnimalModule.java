package com.agroappreact.animales;

import android.content.Context;
import android.database.SQLException;
import android.database.sqlite.SQLiteConstraintException;
import android.net.Uri;

import com.agroappreact.database.DatabaseHelper;
import com.agroappreact.utils.AreteValidator;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class AnimalModule extends ReactContextBaseJavaModule {

    private static final String ERR_ARETE_FORMAT = "ERR_ARETE_FORMAT";
    private static final String ERR_ARETE_DUPLICATE = "ERR_ARETE_DUPLICATE";
    private static final String ERR_ARETE_EMPTY = "ERR_ARETE_EMPTY";

    private final AnimalDAO animalDAO;
    private final ExecutorService executorService;

    public AnimalModule(ReactApplicationContext reactContext) {
        super(reactContext);
        DatabaseHelper dbHelper = DatabaseHelper.getInstance(reactContext);
        this.animalDAO = new AnimalDAO(dbHelper);
        this.executorService = Executors.newSingleThreadExecutor();
    }

    @Override
    public String getName() {
        return "AnimalModule";
    }

    @ReactMethod
    public void insertAnimal(ReadableMap payload, Promise promise) {
        executorService.execute(() -> {
            try {
                String areteRaw = readOptionalString(payload, "arete");
                if (areteRaw == null || areteRaw.trim().isEmpty()) {
                    promise.reject(ERR_ARETE_EMPTY, "El numero de arete es obligatorio.");
                    return;
                }

                String arete = areteRaw.trim();
                if (!AreteValidator.isValid(arete)) {
                    promise.reject(ERR_ARETE_FORMAT, "El arete debe tener 10 digitos y no puede iniciar en 0.");
                    return;
                }

                String especie = readRequiredString(payload, "especie");
                String sexo = readRequiredString(payload, "sexo");
                String fecha = readRequiredString(payload, "fecha");
                String fotoPath = readOptionalString(payload, "foto_path");
                if (fotoPath == null) {
                    fotoPath = readOptionalString(payload, "foto");
                }

                String fotoRelativePath = copyPhotoToInternalStorage(arete, fotoPath);

                Double peso = null;
                if (payload.hasKey("peso") && !payload.isNull("peso")) {
                    peso = payload.getDouble("peso");
                }

                long animalId = animalDAO.insertAnimal(
                        arete,
                        especie,
                        sexo,
                        fecha,
                        peso,
                        fotoRelativePath
                );

                if (animalId <= 0) {
                    promise.reject("ANIMAL_INSERT_ERROR", "No se pudo registrar el animal.");
                    return;
                }

                WritableMap result = Arguments.createMap();
                result.putBoolean("ok", true);
                result.putDouble("animalId", animalId);
                result.putString("arete", arete);
                promise.resolve(result);
            } catch (IllegalArgumentException e) {
                promise.reject("ANIMAL_VALIDATION_ERROR", e.getMessage());
            } catch (SQLiteConstraintException e) {
                promise.reject(ERR_ARETE_DUPLICATE, "El arete ya existe en el registro SINIIGA.");
            } catch (SQLException e) {
                String message = e.getMessage() == null ? "" : e.getMessage().toLowerCase();
                if (message.contains("unique") || message.contains("constraint")) {
                    promise.reject(ERR_ARETE_DUPLICATE, "El arete ya existe en el registro SINIIGA.");
                    return;
                }
                promise.reject("ANIMAL_INSERT_ERROR", "No se pudo registrar el animal: " + e.getMessage());
            } catch (Exception e) {
                promise.reject("ANIMAL_INSERT_ERROR", "No se pudo registrar el animal: " + e.getMessage());
            }
        });
    }

    private String readRequiredString(ReadableMap payload, String key) {
        String value = readOptionalString(payload, key);
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("El campo " + key + " es obligatorio.");
        }
        return value.trim();
    }

    private String readOptionalString(ReadableMap payload, String key) {
        if (!payload.hasKey(key) || payload.isNull(key)) {
            return null;
        }
        return payload.getString(key);
    }

    private String copyPhotoToInternalStorage(String arete, String sourcePath) throws IOException {
        if (sourcePath == null || sourcePath.trim().isEmpty()) {
            return null;
        }

        Context context = getReactApplicationContext();
        File photosDir = new File(context.getFilesDir(), "fotos/animales");
        if (!photosDir.exists() && !photosDir.mkdirs()) {
            throw new IOException("No se pudo crear la carpeta de fotos internas.");
        }

        File destinationFile = new File(photosDir, arete + ".jpg");
        try (InputStream inputStream = openPhotoInputStream(sourcePath);
             OutputStream outputStream = new FileOutputStream(destinationFile)) {
            if (inputStream == null) {
                throw new IOException("No se pudo abrir la fotografia capturada.");
            }

            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }
            outputStream.flush();
        }

        return "fotos/animales/" + arete + ".jpg";
    }

    private InputStream openPhotoInputStream(String sourcePath) throws IOException {
        Uri uri = Uri.parse(sourcePath);
        String scheme = uri.getScheme();

        if (scheme == null || scheme.isEmpty()) {
            return new FileInputStream(new File(sourcePath));
        }

        if ("file".equalsIgnoreCase(scheme) || "content".equalsIgnoreCase(scheme)) {
            InputStream inputStream = getReactApplicationContext().getContentResolver().openInputStream(uri);
            if (inputStream == null) {
                throw new IOException("No se pudo leer la fotografia desde la URI.");
            }
            return inputStream;
        }

        return new FileInputStream(new File(sourcePath));
    }
}
