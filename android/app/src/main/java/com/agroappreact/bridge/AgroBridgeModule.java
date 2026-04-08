package com.agroappreact.bridge;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

public class AgroBridgeModule extends ReactContextBaseJavaModule {

    public AgroBridgeModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        // Este nombre es el que usaremos desde JS en NativeModules.AgroBridgeModule
        return "AgroBridgeModule";
    }

    @ReactMethod
    public void testConnection(String nombre, Promise promise) {
        try {
            // Respuesta simple para confirmar que el puente JS -> Java -> JS funciona.
            String nombreSeguro = (nombre == null || nombre.trim().isEmpty()) ? "usuario" : nombre.trim();
            String mensaje = "Bridge OK. Hola " + nombreSeguro + ", saludo desde Java.";
            promise.resolve(mensaje);
        } catch (Exception e) {
            promise.reject("BRIDGE_TEST_ERROR", "Fallo en testConnection: " + e.getMessage());
        }
    }

    @ReactMethod
    public void getBridgeInfo(Promise promise) {
        try {
            // Devolvemos un objeto sencillo para validar tipos soportados por el bridge.
            WritableMap info = Arguments.createMap();
            info.putString("module", "AgroBridgeModule");
            info.putString("language", "Java");
            info.putBoolean("ready", true);
            info.putString("pattern", "Native Modules Bridge");

            promise.resolve(info);
        } catch (Exception e) {
            promise.reject("BRIDGE_INFO_ERROR", "Fallo en getBridgeInfo: " + e.getMessage());
        }
    }
}