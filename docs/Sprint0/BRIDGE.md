# BRIDGE.md — Guía Técnica Bridge JS↔Java (Native Modules)

> AgroApp · React Native 0.84.1 · Bridge clásico `@ReactMethod`  
> Responsable: Gómez Martínez Luis Ernesto  
> Sprint 0 · v1.0

---

## 1. Flujo de Comunicación

```
React Native (TypeScript)
        │
        │  NativeModules.<Módulo>.<método>(params, callback)
        │  o Promise vía Callback
        ▼
NativeModulesBridge.java
        │
        │  @ReactMethod — hilo nativo de Android
        ▼
Java Module (ReactContextBaseJavaModule)
        │
        │  ReadableMap / ReadableArray  (nunca JSON crudo)
        ▼
DAO (Repository Pattern)
        │
        ▼
SQLite (agroapp.db)
```

**Regla de oro:** Las operaciones de base de datos se ejecutan en un `ExecutorService` para no bloquear el hilo del Bridge. `AsyncTask` está **prohibido** (incompatible con `targetSdk 34+`).

---

## 2. Restricciones Críticas del Bridge

| ✅ Permitido | ❌ Prohibido |
|---|---|
| `ReadableMap`, `ReadableArray` como parámetros | JSON string crudo en parámetros |
| `ExecutorService` para operaciones de BD | `AsyncTask` (deprecado en targetSdk 34+) |
| `Promise` o `Callback` para resultados | Bloquear el hilo del Bridge |
| Llamadas locales a SQLite | Llamadas de red (fetch/HTTP) — app es offline-first |
| `promise.resolve()` o `promise.reject()` | Dejar un Promise sin resolver |

---

## 3. Implementación de un Native Module — Paso a Paso

### Paso 1 — Clase Java del módulo

```java
// android/app/src/main/java/com/agroappreact/AnimalModule.java
package com.agroappreact;

import com.facebook.react.bridge.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class AnimalModule extends ReactContextBaseJavaModule {

    private final AnimalDAO animalDAO;
    private final ExecutorService executorService = Executors.newSingleThreadExecutor();

    public AnimalModule(ReactApplicationContext context) {
        super(context);
        this.animalDAO = new AnimalDAO(context);
    }

    @Override
    public String getName() {
        return "AnimalModule"; // Nombre expuesto a JS via NativeModules
    }

    @ReactMethod
    public void insertarAnimal(ReadableMap data, Promise promise) {
        executorService.execute(() -> {
            try {
                long id = animalDAO.insertAnimal(data);
                promise.resolve((double) id);
            } catch (Exception e) {
                promise.reject("DB_ERROR", "Error al insertar animal: " + e.getMessage());
            }
        });
    }

    @ReactMethod
    public void obtenerAnimales(Promise promise) {
        executorService.execute(() -> {
            try {
                WritableArray lista = animalDAO.getAllAnimales();
                promise.resolve(lista);
            } catch (Exception e) {
                promise.reject("DB_ERROR", "Error al obtener animales: " + e.getMessage());
            }
        });
    }
}
```

### Paso 2 — Package del módulo

```java
// android/app/src/main/java/com/agroappreact/AgroAppPackage.java
package com.agroappreact;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class AgroAppPackage implements ReactPackage {

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext context) {
        return Arrays.asList(
            new AnimalModule(context),
            new EventoSanitarioModule(context),
            new GastoModule(context),
            new HistorialClinicoModule(context),
            new AlimentacionModule(context),
            new UsuarioModule(context)
        );
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext context) {
        return Collections.emptyList();
    }
}
```

### Paso 3 — Registro en MainApplication.java

```java
// android/app/src/main/java/com/agroappreact/MainApplication.java
@Override
protected List<ReactPackage> getPackages() {
    return Arrays.asList(
        new MainReactPackage(),
        new AgroAppPackage()  // ← Registrar aquí
    );
}
```

### Paso 4 — Wrapper TypeScript (src/native/)

```typescript
// src/native/AnimalModule.ts
import { NativeModules } from 'react-native';

const { AnimalModule } = NativeModules;

if (!AnimalModule) {
  throw new Error('AnimalModule no está disponible. ¿Está registrado en AgroAppPackage?');
}

export interface AnimalData {
  arete: string;          // 10 dígitos SINIIGA obligatorios
  nombre?: string;
  raza: string;
  sexo: 'M' | 'H';
  fechaNacimiento: string; // ISO 8601
  peso?: number;
  estado: 'activo' | 'vendido' | 'muerto';
}

export const insertarAnimal = (data: AnimalData): Promise<number> =>
  AnimalModule.insertarAnimal(data);

export const obtenerAnimales = (): Promise<AnimalData[]> =>
  AnimalModule.obtenerAnimales();

export const obtenerAnimalPorArete = (arete: string): Promise<AnimalData | null> =>
  AnimalModule.obtenerAnimalPorArete(arete);

export const actualizarAnimal = (arete: string, data: Partial<AnimalData>): Promise<boolean> =>
  AnimalModule.actualizarAnimal(arete, data);

export const eliminarAnimal = (arete: string): Promise<boolean> =>
  AnimalModule.eliminarAnimal(arete);
```

---

## 4. Tipos de Datos Soportados por el Bridge

| TypeScript | Java / Bridge |
|---|---|
| `string` | `String` |
| `number` | `double` |
| `boolean` | `boolean` |
| `Object` (plano) | `ReadableMap` |
| `Array` | `ReadableArray` |
| `null` / `undefined` | `null` |
| — | `WritableMap` (retorno al JS) |
| — | `WritableArray` (retorno al JS) |

**No soportado directamente:** `Date`, clases personalizadas, funciones.  
Para fechas: usar `string` en formato ISO 8601 (`"2026-04-04"`).

---

## 5. Módulos del Bridge en AgroApp

| Clase Java | Wrapper TypeScript | RF cubiertos | Sprint |
|---|---|---|---|
| `AnimalModule` | `src/native/AnimalModule.ts` | RF001, RF002, RF003 | S1 |
| `EventoSanitarioModule` | `src/native/EventoSanitarioModule.ts` | RF007, RF008, RF009 | S2 |
| `GastoModule` | `src/native/GastoModule.ts` | RF006, RF012 | S2 |
| `HistorialClinicoModule` | `src/native/HistorialClinicoModule.ts` | RF010 | S3 |
| `AlimentacionModule` | `src/native/AlimentacionModule.ts` | RF004, RF005 | S3 |
| `UsuarioModule` | `src/native/UsuarioModule.ts` | RF013 | S1 |

---

## 6. Patrón de Manejo de Errores en React Native

```typescript
// En una pantalla o hook de React Native
import { insertarAnimal, AnimalData } from '../native/AnimalModule';

const guardarAnimal = async (datos: AnimalData) => {
  try {
    const id = await insertarAnimal(datos);
    console.log(`Animal guardado con ID: ${id}`);
    // actualizar UI
  } catch (error: any) {
    console.error(`Error [${error.code}]: ${error.message}`);
    // mostrar alerta al usuario
  }
};
```

---

## 7. NotificationHelper — AlarmManager

Los eventos sanitarios programan alarmas locales vía `AlarmManager`. Esta lógica se llama **directamente desde Java** al registrar un evento en el DAO, sin pasar por el Bridge.

```java
// Desde EventoSanitarioDAO.insert() — llamada directa a Java
NotificationHelper.programarAlarma(
    context,
    eventoId,      // ID del evento (para cancelar si se borra)
    fechaEvento,   // Timestamp Unix (ms)
    nombreAnimal,  // Para el texto de la notificación
    tipoEvento     // "Vacuna", "Desparasitación", "Vitamina"
);
```

`NotificationHelper` programa **3 alarmas por evento**: 7 días antes, 1 día antes y el día exacto.

---

*Última actualización: Sprint 0 — Abril 2026*
