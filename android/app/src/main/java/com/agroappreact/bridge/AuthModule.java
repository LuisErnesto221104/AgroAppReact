package com.agroappreact.bridge;

import android.database.SQLException;
import android.database.sqlite.SQLiteConstraintException;

import com.agroappreact.dao.UsuarioDAO;
import com.agroappreact.database.DatabaseHelper;
import com.agroappreact.models.Usuario;
import com.agroappreact.security.PinSecurity;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class AuthModule extends ReactContextBaseJavaModule {

    private final UsuarioDAO usuarioDAO;
    private final ExecutorService executorService;

    public AuthModule(ReactApplicationContext reactContext) {
        super(reactContext);
        DatabaseHelper dbHelper = DatabaseHelper.getInstance(reactContext);
        this.usuarioDAO = new UsuarioDAO(dbHelper);
        this.executorService = Executors.newSingleThreadExecutor();
    }

    @Override
    public String getName() {
        return "AuthModule";
    }

    @ReactMethod
    public void getAuthStatus(Promise promise) {
        executorService.execute(() -> {
            try {
                Usuario admin = usuarioDAO.obtenerAdmin();
                Usuario principal = admin != null ? admin : usuarioDAO.obtenerUsuarioNormal();

                WritableMap result = Arguments.createMap();
                result.putBoolean("hasUsers", usuarioDAO.existeAlgunUsuario());
                result.putString("primaryUserName", principal != null ? principal.getNombre() : "");
                result.putBoolean("isAdminPrimary", principal != null && principal.esAdmin());

                promise.resolve(result);
            } catch (Exception e) {
                promise.reject("AUTH_STATUS_ERROR", "No se pudo leer estado de autenticacion: " + e.getMessage());
            }
        });
    }

    @ReactMethod
    public void loginPrimaryUser(String pin, Promise promise) {
        executorService.execute(() -> {
            try {
                // Flujo del prototipo: login por PIN para el usuario principal (admin o primer usuario).
                Usuario principal = usuarioDAO.obtenerAdmin();
                if (principal == null) {
                    principal = usuarioDAO.obtenerUsuarioNormal();
                }

                if (principal == null) {
                    promise.reject("AUTH_NO_USERS", "No hay usuarios registrados en el dispositivo.");
                    return;
                }

                validarPin(pin);
                String hash = PinSecurity.hashPin(pin);
                boolean ok = hash.equals(principal.getPin());

                if (!ok) {
                    promise.reject("AUTH_INVALID_PIN", "PIN incorrecto. Intente de nuevo.");
                    return;
                }

                WritableMap result = Arguments.createMap();
                result.putBoolean("ok", true);
                result.putInt("userId", principal.getId());
                result.putString("name", principal.getNombre());
                result.putString("role", principal.getRol().name());
                promise.resolve(result);
            } catch (IllegalArgumentException e) {
                promise.reject("AUTH_VALIDATION_ERROR", e.getMessage());
            } catch (Exception e) {
                promise.reject("AUTH_LOGIN_ERROR", "No se pudo validar el PIN: " + e.getMessage());
            }
        });
    }

    @ReactMethod
    public void login(String nombre, String pin, Promise promise) {
        executorService.execute(() -> {
            try {
                // VLD-001, VLD-002 y VLD-003 se validan en Java antes de tocar SQLite.
                validarNombre(nombre);
                validarPin(pin);

                String hash = PinSecurity.hashPin(pin);
                Usuario usuario = usuarioDAO.validarCredenciales(nombre.trim(), hash);

                if (usuario == null) {
                    promise.reject("AUTH_INVALID_CREDENTIALS", "Usuario o PIN incorrectos.");
                    return;
                }

                WritableMap result = Arguments.createMap();
                result.putBoolean("ok", true);
                result.putInt("userId", usuario.getId());
                result.putString("name", usuario.getNombre());
                result.putString("role", usuario.getRol().name());
                promise.resolve(result);
            } catch (IllegalArgumentException e) {
                promise.reject("AUTH_VALIDATION_ERROR", e.getMessage());
            } catch (Exception e) {
                promise.reject("AUTH_LOGIN_ERROR", "No se pudo iniciar sesion: " + e.getMessage());
            }
        });
    }

    @ReactMethod
    public void registerUser(String nombre, String pin, Promise promise) {
        executorService.execute(() -> {
            try {
                // VLD-001, VLD-002, VLD-003 y VLD-005 se aplican aqui.
                validarNombre(nombre);
                validarPin(pin);

                String hash = PinSecurity.hashPin(pin);
                Usuario usuario = new Usuario();
                usuario.setNombre(nombre.trim());
                usuario.setPin(hash);

                long id = usuarioDAO.insertarUsuario(usuario);
                if (id <= 0) {
                    promise.reject("AUTH_REGISTER_ERROR", "No se pudo registrar el usuario.");
                    return;
                }

                WritableMap result = Arguments.createMap();
                result.putBoolean("ok", true);
                result.putDouble("userId", id);
                result.putString("name", usuario.getNombre());
                promise.resolve(result);
            } catch (IllegalArgumentException e) {
                promise.reject("AUTH_VALIDATION_ERROR", e.getMessage());
            } catch (SQLiteConstraintException e) {
                // VLD-004: nombre duplicado detectado por constraint UNIQUE.
                promise.reject("AUTH_DUPLICATE_USER", "El nombre de usuario ya existe.");
            } catch (SQLException e) {
                String message = e.getMessage() == null ? "" : e.getMessage().toLowerCase();
                if (message.contains("unique") || message.contains("constraint")) {
                    promise.reject("AUTH_DUPLICATE_USER", "El nombre de usuario ya existe.");
                    return;
                }
                promise.reject("AUTH_REGISTER_ERROR", "No se pudo registrar el usuario: " + e.getMessage());
            } catch (Exception e) {
                promise.reject("AUTH_REGISTER_ERROR", "No se pudo registrar el usuario: " + e.getMessage());
            }
        });
    }

    private void validarPin(String pin) {
        if (!PinSecurity.isPinFormatValid(pin)) {
            throw new IllegalArgumentException("El PIN debe contener solo digitos y tener entre 4 y 6 caracteres.");
        }
    }

    private void validarNombre(String nombre) {
        if (nombre == null || nombre.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de usuario no puede estar vacio.");
        }
    }
}