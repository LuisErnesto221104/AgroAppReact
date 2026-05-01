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
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class AnimalModule extends ReactContextBaseJavaModule {

    private static final String ERR_ARETE_FORMAT = "ERR_ARETE_FORMAT";
    private static final String ERR_ARETE_DUPLICATE = "ERR_ARETE_DUPLICATE";
    private static final String ERR_ARETE_EMPTY = "ERR_ARETE_EMPTY";
    private static final String ERR_NOT_FOUND = "ERR_ANIMAL_NOT_FOUND";
    private static final String ERR_ESTADO_FINAL = "ERR_ESTADO_FINAL";
    private static final String ERR_ESTADO_TRANSITION = "ERR_ESTADO_TRANSITION";

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

    @ReactMethod
    public void listAnimals(Promise promise) {
        executorService.execute(() -> {
            try {
                List<AnimalDAO.AnimalRecord> animals = animalDAO.listAnimals();
                WritableArray result = Arguments.createArray();
                for (AnimalDAO.AnimalRecord animal : animals) {
                    result.pushMap(toWritableMap(animal));
                }
                promise.resolve(result);
            } catch (Exception e) {
                promise.reject("ANIMAL_LIST_ERROR", "No se pudo obtener el listado de animales: " + e.getMessage());
            }
        });
    }

    @ReactMethod
    public void updateAnimal(ReadableMap payload, Promise promise) {
        executorService.execute(() -> {
            try {
                if (!payload.hasKey("id") || payload.isNull("id")) {
                    promise.reject("ANIMAL_VALIDATION_ERROR", "El id del animal es obligatorio.");
                    return;
                }

                long id = (long) payload.getDouble("id");
                AnimalDAO.AnimalRecord current = animalDAO.getAnimalById(id);
                if (current == null) {
                    promise.reject(ERR_NOT_FOUND, "No se encontro el animal a editar.");
                    return;
                }

                String especie = readRequiredString(payload, "especie");
                String sexo = readRequiredString(payload, "sexo");
                String fecha = readRequiredString(payload, "fecha");
                String newPhotoPath = readOptionalString(payload, "foto_path");
                Double peso = null;
                if (payload.hasKey("peso") && !payload.isNull("peso")) {
                    peso = payload.getDouble("peso");
                }

                String fotoRelativePath = current.foto;
                if (newPhotoPath != null && !newPhotoPath.trim().isEmpty()) {
                    fotoRelativePath = copyPhotoToInternalStorage(current.arete, newPhotoPath);
                }

                int updatedRows = animalDAO.updateAnimal(
                        id,
                        especie,
                        sexo,
                        fecha,
                        peso,
                        fotoRelativePath,
                        String.valueOf(System.currentTimeMillis())
                );

                if (updatedRows <= 0) {
                    promise.reject("ANIMAL_UPDATE_ERROR", "No se pudo actualizar el animal.");
                    return;
                }

                AnimalDAO.AnimalRecord updated = animalDAO.getAnimalById(id);
                WritableMap result = Arguments.createMap();
                result.putBoolean("ok", true);
                result.putMap("animal", updated == null ? toWritableMap(current) : toWritableMap(updated));
                promise.resolve(result);
            } catch (IllegalArgumentException e) {
                promise.reject("ANIMAL_VALIDATION_ERROR", e.getMessage());
            } catch (Exception e) {
                promise.reject("ANIMAL_UPDATE_ERROR", "No se pudo actualizar el animal: " + e.getMessage());
            }
        });
    }

    @ReactMethod
    public void getAnimalesByEstado(String estado, Promise promise) {
        executorService.execute(() -> {
            try {
                String normalizedEstado = normalizeEstado(estado);
                List<AnimalDAO.AnimalRecord> animals = animalDAO.getAnimalesByEstado(normalizedEstado);
                WritableArray result = Arguments.createArray();
                for (AnimalDAO.AnimalRecord animal : animals) {
                    result.pushMap(toWritableMap(animal));
                }
                promise.resolve(result);
            } catch (IllegalArgumentException e) {
                promise.reject("ANIMAL_VALIDATION_ERROR", e.getMessage());
            } catch (Exception e) {
                promise.reject("ANIMAL_LIST_ERROR", "No se pudo obtener animales por estado: " + e.getMessage());
            }
        });
    }

    @ReactMethod
    public void changeEstado(ReadableMap payload, Promise promise) {
        executorService.execute(() -> {
            try {
                if (!payload.hasKey("id") || payload.isNull("id")) {
                    promise.reject("ANIMAL_VALIDATION_ERROR", "El id del animal es obligatorio.");
                    return;
                }

                long id = (long) payload.getDouble("id");
                AnimalDAO.AnimalRecord current = animalDAO.getAnimalById(id);
                if (current == null) {
                    promise.reject(ERR_NOT_FOUND, "No se encontro el animal a actualizar estado.");
                    return;
                }

                String currentEstado = normalizeEstado(current.estado);
                if (isFinalEstado(currentEstado)) {
                    promise.reject(ERR_ESTADO_FINAL, "El animal ya esta en un estado final y no puede cambiarse.");
                    return;
                }

                String targetEstado = normalizeEstado(readRequiredString(payload, "estado"));
                if (!"ACTIVO".equals(currentEstado) || !"FALLECIDO".equals(targetEstado)) {
                    promise.reject(ERR_ESTADO_TRANSITION, "Transicion de estado no permitida.");
                    return;
                }

                String fechaBaja = readRequiredString(payload, "fecha_baja");
                String motivoBaja = readRequiredString(payload, "motivo_baja");

                int changedRows = animalDAO.changeEstado(
                        id,
                        targetEstado,
                        fechaBaja,
                        motivoBaja,
                        String.valueOf(System.currentTimeMillis())
                );

                if (changedRows <= 0) {
                    promise.reject("ANIMAL_UPDATE_ERROR", "No se pudo cambiar el estado del animal.");
                    return;
                }

                AnimalDAO.AnimalRecord updated = animalDAO.getAnimalById(id);
                WritableMap result = Arguments.createMap();
                result.putBoolean("ok", true);
                result.putMap("animal", updated == null ? toWritableMap(current) : toWritableMap(updated));
                promise.resolve(result);
            } catch (IllegalArgumentException e) {
                promise.reject("ANIMAL_VALIDATION_ERROR", e.getMessage());
            } catch (Exception e) {
                promise.reject("ANIMAL_UPDATE_ERROR", "No se pudo cambiar estado: " + e.getMessage());
            }
        });
    }

    @ReactMethod
    public void deleteAnimal(ReadableMap payload, Promise promise) {
        executorService.execute(() -> {
            try {
                if (!payload.hasKey("id") || payload.isNull("id")) {
                    promise.reject("ANIMAL_VALIDATION_ERROR", "El id del animal es obligatorio.");
                    return;
                }

                long id = (long) payload.getDouble("id");
                AnimalDAO.AnimalRecord animal = animalDAO.getAnimalById(id);
                if (animal == null) {
                    promise.reject(ERR_NOT_FOUND, "No se encontro el animal a eliminar.");
                    return;
                }

                deleteAnimalPhotoIfExists(animal.arete);

                int deletedRows = animalDAO.deleteAnimal(id);
                if (deletedRows <= 0) {
                    promise.reject("ANIMAL_DELETE_ERROR", "No se pudo eliminar el animal.");
                    return;
                }

                WritableMap result = Arguments.createMap();
                result.putBoolean("ok", true);
                result.putDouble("animalId", id);
                promise.resolve(result);
            } catch (Exception e) {
                promise.reject("ANIMAL_DELETE_ERROR", "No se pudo eliminar el animal: " + e.getMessage());
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

    private void deleteAnimalPhotoIfExists(String arete) {
        if (arete == null || arete.trim().isEmpty()) {
            return;
        }

        Context context = getReactApplicationContext();
        File photoFile = new File(context.getFilesDir(), "fotos/animales/" + arete + ".jpg");
        if (photoFile.exists()) {
            // Si falla el borrado físico, no bloqueamos el delete SQL.
            photoFile.delete();
        }
    }

    private WritableMap toWritableMap(AnimalDAO.AnimalRecord record) {
        WritableMap map = Arguments.createMap();
        map.putDouble("id", record.id);
        map.putString("arete", record.arete);
        map.putString("especie", record.especie);
        map.putString("sexo", record.sexo);
        map.putString("fecha", record.fecha);
        if (record.peso == null) {
            map.putNull("peso");
        } else {
            map.putDouble("peso", record.peso);
        }
        if (record.foto == null) {
            map.putNull("foto");
        } else {
            map.putString("foto", record.foto);
        }
        map.putString("estado", normalizeEstado(record.estado));
        if (record.fechaBaja == null) {
            map.putNull("fecha_baja");
        } else {
            map.putString("fecha_baja", record.fechaBaja);
        }
        if (record.motivoBaja == null) {
            map.putNull("motivo_baja");
        } else {
            map.putString("motivo_baja", record.motivoBaja);
        }
        return map;
    }

    private String normalizeEstado(String estado) {
        if (estado == null || estado.trim().isEmpty()) {
            return "ACTIVO";
        }
        String normalized = estado.trim().toUpperCase();
        if (!"ACTIVO".equals(normalized) && !"VENDIDO".equals(normalized) && !"FALLECIDO".equals(normalized)) {
            throw new IllegalArgumentException("Estado no valido. Usa ACTIVO, VENDIDO o FALLECIDO.");
        }
        return normalized;
    }

    private boolean isFinalEstado(String estado) {
        return "VENDIDO".equals(estado) || "FALLECIDO".equals(estado);
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
