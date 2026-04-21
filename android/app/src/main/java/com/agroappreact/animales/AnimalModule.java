package com.agroappreact.animales;

import android.database.SQLException;
import android.database.sqlite.SQLiteConstraintException;

import com.agroappreact.database.DatabaseHelper;
import com.agroappreact.utils.AreteValidator;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

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
                String foto = readOptionalString(payload, "foto");

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
                        foto
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
}
