# Guía de Contribución — AgroApp

> **Proyecto:** AgroApp (`com.agroappreact`) · v1.3 · versionCode 4  
> **Stack:** React Native 0.84.1 · React 19.2.3 · TypeScript 5.8.3 · Java 21 · Android minSdk 24

---

## Índice

1. [Requisitos previos](#1-requisitos-previos)
2. [Configuración del entorno](#2-configuración-del-entorno)
3. [Estructura del proyecto](#3-estructura-del-proyecto)
4. [Convenciones de código](#4-convenciones-de-código)
5. [Módulos nativos (Java ↔ TypeScript)](#5-módulos-nativos-java--typescript)
6. [Flujo de trabajo Git](#6-flujo-de-trabajo-git)
7. [Compilar e instalar](#7-compilar-e-instalar)
8. [Base de datos SQLite](#8-base-de-datos-sqlite)
9. [Paleta de diseño](#9-paleta-de-diseño)
10. [Qué NO hacer](#10-qué-no-hacer)

---

## 1. Requisitos previos

| Herramienta | Versión mínima | Verificar |
|-------------|---------------|-----------|
| Node.js | 20 LTS | `node -v` |
| Java JDK | 21 | `java -version` |
| Android SDK | API 24–36 | Android Studio SDK Manager |
| Android Build Tools | 36 | Android Studio |
| Git | cualquiera | `git --version` |

Variables de entorno necesarias en `~/.bashrc` o `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/AppData/Local/Android/Sdk   # Windows
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
```

---

## 2. Configuración del entorno

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd "AgroAppReact V2"

# 2. Instalar dependencias JS
npm install

# 3. Verificar dispositivo conectado
adb devices

# 4. Iniciar Metro (en otra terminal)
npm start

# 5. Compilar e instalar en dispositivo
npm run android
```

Para compilar el APK de release directamente:

```bash
# Bundle JS
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res

# Compilar APK
cd android && ./gradlew assembleRelease

# Instalar
adb install -r app/build/outputs/apk/release/app-release.apk
```

> **Build limpio** (necesario tras añadir módulos nativos nuevos):
> ```bash
> cd android && ./gradlew clean assembleRelease
> ```

---

## 3. Estructura del proyecto

```
AgroAppReact V2/
├── android/                          # Proyecto Android nativo
│   └── app/src/main/java/com/agroappreact/
│       ├── bridge/          AgroBridgeModule, AgroAppPackage
│       ├── costs/           CostosModule, CostosModulePackage
│       ├── pdf/             PdfModule, PdfModulePackage
│       ├── share/           ShareModule (AgroShareModule), ShareModulePackage
│       ├── animales/        AnimalModule, AnimalDAO
│       ├── dao/             EventoSanitarioDAO, GastoDAO, HistorialClinicoDAO
│       ├── database/        DatabaseHelper (Singleton, v12)
│       └── models/          Animal, EventoSanitario, Gasto
│
└── src/
    ├── components/          Componentes reutilizables
    │   ├── animales/        Cards y badges de animales
    │   └── sanitarios/      CalendarioMensual
    ├── features/            Módulos por dominio
    │   ├── animals/         AnimalsScreen, HistorialClinico
    │   ├── costs/           GestionGastosScreen, RegistrarGastoScreen,
    │   │                    FiltroGastosModal
    │   ├── health/          HealthScreen (eventos sanitarios)
    │   ├── home/            HomeScreen
    │   ├── notifications/   NotificationsScreen
    │   └── reports/         ReportesMenuScreen, ReporteHatoScreen,
    │                        ReporteAnimalScreen
    ├── hooks/               useCalendarioSanitario, useHistorialClinico,
    │                        useSearch, useEventoSanitario
    ├── native/              Bridges TypeScript ↔ módulos nativos
    │   ├── BridgeModule.ts  AgroBridgeModule (principal)
    │   ├── pdfModule.ts     PdfModule (PDF offline)
    │   ├── shareModule.ts   AgroShareModule (compartir archivos)
    │   ├── CostosModule.ts  CostosModule (filtros de gastos)
    │   ├── AnimalModule.ts  AnimalModule
    │   └── AuthModule.ts    AuthModule
    ├── navigation/          AppNavigator, AnimalesNavigator, CostsNavigator
    ├── screens/             Pantallas no migradas a features/
    │   ├── animales/        DetalleAnimal, EditarAnimal, RegistrarAnimal, Listado
    │   ├── auth/            AuthFlow
    │   ├── nutricion/       RecomendacionesNutricionales
    │   └── sanitarios/      CalendarioSanitario, RegistrarEventoSanitario
    ├── shared/
    │   ├── theme/identity.ts   COLORS, FONTS (fuente de verdad del tema)
    │   └── services/           sessionManager, notificacionSanitaria
    └── types/               Animal.ts, Costos.ts, Sanitario.ts, Nutricion.ts
```

---

## 4. Convenciones de código

### TypeScript / React Native

**Nombrado de archivos:**
- Pantallas y componentes: `PascalCase.tsx` — `ReporteAnimalScreen.tsx`
- Hooks: `camelCase.ts` con prefijo `use` — `useHistorialClinico.ts`
- Módulos nativos: `camelCase.ts` — `pdfModule.ts`, `shareModule.ts`
- Tipos: `PascalCase.ts` — `Costos.ts`, `Animal.ts`

**Componentes:**
```typescript
// Siempre funcional con props tipadas
interface MiComponenteProps {
  valor: string;
  onPress: () => void;
  opcional?: number;
}

export function MiComponente({ valor, onPress, opcional }: MiComponenteProps) {
  // ...
}
```

**Estados de carga — patrón estándar:**
```typescript
const [cargando, setCargando] = useState(false);
const [error, setError]       = useState<string | null>(null);
const [datos, setDatos]       = useState<Tipo | null>(null);

const cargar = async () => {
  setCargando(true);
  setError(null);
  try {
    const resultado = await modulo.metodo();
    setDatos(resultado);
  } catch (e: any) {
    setError(e.message || 'Error inesperado');
  } finally {
    setCargando(false);
  }
};
```

**`useCallback` con dependencias:**
```typescript
// Cuando la función depende de estados (p. ej. filtros), usar useCallback
const cargarGastos = useCallback(async () => {
  // usa filtros aquí
}, [filtros]);  // ← se re-ejecuta automáticamente al cambiar filtros

useEffect(() => { void cargarGastos(); }, [cargarGastos]);
```

**StyleSheet:**
```typescript
// Siempre al final del archivo, tipado implícito
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f8f0' },
  // ...
});
```

**Paleta — usar constantes de `identity.ts`:**
```typescript
import { COLORS, FONTS } from '../shared/theme/identity';
// COLORS.primary = '#07612d'
// FONTS.bold / FONTS.semiBold / FONTS.regular
```

### Java (módulos nativos)

**Nombrado de módulos:**
```java
@Override
public String getName() {
    return "MiModulo";  // Único — verificar que no colisione con módulos internos de RN
}
```

> ⚠️ React Native tiene un módulo interno llamado `ShareModule`. Por eso el módulo propio se llama `AgroShareModule`. Antes de nombrar un módulo, verificar con `NativeModules` en JS que el nombre esté libre.

**Patrón de método nativo:**
```java
private final ExecutorService executor = Executors.newSingleThreadExecutor();

@ReactMethod
public void miMetodo(double idDouble, Promise promise) {
    executor.execute(() -> {
        try {
            int id = (int) idDouble;  // JS pasa números como double
            // lógica...
            promise.resolve(resultado);
        } catch (Exception e) {
            promise.reject("ERROR_CODE", e.getMessage(), e);
        }
    });
}
```

- **Siempre** usar `executor.execute()` — nunca AsyncTask, nunca hilo principal.
- Los IDs numéricos llegan de JS como `double` → castear a `int`.
- Usar `TextUtils.isEmpty()` para validar strings que pueden ser `null` o `""`.

**Registro de módulo nuevo:**

1. Crear `MiModulo.java` + `MiModuloPackage.java` en un package propio.
2. Agregar a `MainApplication.kt`:
```kotlin
import com.agroappreact.minuevopkg.MiModuloPackage

// En getPackages():
add(MiModuloPackage())
```
3. Ejecutar **clean build** — builds incrementales pueden ignorar el módulo nuevo.

---

## 5. Módulos nativos Java ↔ TypeScript

### Patrón de bridge TypeScript

```typescript
// src/native/miModulo.ts
import { NativeModules } from 'react-native';

interface MiModuloInterface {
  miMetodo(param: number): Promise<string>;
}

const { MiModulo } = NativeModules;

// Validar en tiempo de llamada (no de carga)
// NativeModules puede devolver {} vacío en lugar de null
export const miModulo: MiModuloInterface = {
  miMetodo(param: number): Promise<string> {
    if (!MiModulo || typeof MiModulo.miMetodo !== 'function') {
      return Promise.reject(new Error('MiModulo no disponible'));
    }
    return MiModulo.miMetodo(param) as Promise<string>;
  },
};
```

> **Por qué validar con `typeof method !== 'function'` y no `?? guard`:**  
> Con la nueva arquitectura (`newArchEnabled=true`), `NativeModules.X` puede devolver un objeto vacío `{}` que es *truthy* aunque no tenga los métodos. El operador `??` no lo detecta. La validación `typeof` sí.

### Módulos registrados actualmente

| Nombre nativo | Package Java | Bridge TS | Propósito |
|---------------|-------------|-----------|-----------|
| `AgroBridgeModule` | `bridge/` | `BridgeModule.ts` | Bridge principal — animales, eventos, gastos base |
| `PdfModule` | `pdf/` | `pdfModule.ts` | Generación de PDFs offline con iText7 |
| `AgroShareModule` | `share/` | `shareModule.ts` | Compartir archivos con MediaStore/FileProvider |
| `CostosModule` | `costs/` | `CostosModule.ts` | Consultas de gastos con filtros dinámicos |
| `AnimalModule` | `animales/` | `AnimalModule.ts` | CRUD de animales |
| `AuthModule` | `bridge/` | `AuthModule.ts` | Autenticación con PIN |
| `NotificationNativeModule` | `bridge/` | — | Notificaciones locales |

---

## 6. Flujo de trabajo Git

### Nombrado de commits

El proyecto sigue la convención `Descriptor_Sprint#`:

```
AnexoA_Sprint4     ← funcionalidad principal del anexo
AnexoB_Sprint4
Mejoras_Sprint4
Documentacion_Sprint4
```

Para cambios puntuales durante el sprint:

```
Fix_NombreDelBug
AjusteNombreFeature_Sprint4
Logo_Final
```

### Ramas

- `master` — rama principal, siempre compilable
- Trabajar directamente en `master` para sprints pequeños, o crear rama `sprint4/feature-x` para cambios grandes.

### Antes de hacer commit

```bash
# Verificar que el bundle compila sin errores
npx react-native bundle --platform android --dev false \
  --entry-file index.js \
  --bundle-output /dev/null 2>&1 | grep -i error

# Verificar tipos TypeScript
npx tsc --noEmit

# Lint
npm run lint
```

---

## 7. Compilar e instalar

### Desarrollo (con Metro, hot reload)

```bash
# Terminal 1
npm start

# Terminal 2
npm run android
```

### Release (APK firmado para distribuir)

```bash
# 1. Bundle JS optimizado
npx react-native bundle \
  --platform android --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res

# 2. Compilar APK
cd android && ./gradlew assembleRelease

# 3. Instalar via ADB
adb install -r app/build/outputs/apk/release/app-release.apk
```

### Después de añadir/modificar módulos Java

```bash
# Obligatorio: build limpio para forzar recompilación completa
cd android && ./gradlew clean assembleRelease
```

> Los builds incrementales de Gradle pueden omitir módulos nuevos y reportar
> `NativeModules.MiModulo` como `null` aunque esté registrado correctamente.
> `clean` ejecuta todas las tareas desde cero.

---

## 8. Base de datos SQLite

**Helper:** `DatabaseHelper.java` — Singleton, versión actual **12**.

### Tablas principales

| Tabla | Columnas clave | Notas |
|-------|---------------|-------|
| `animales` | `id`, `numero_arete` (UNIQUE), `especie`, `sexo`, `estado`, `peso_actual`, `raza`, `fecha_ingreso` | `estado`: ACTIVO / VENDIDO / FALLECIDO |
| `eventos_sanitarios` | `id`, `animal_id` FK, `tipo_evento`, `descripcion`, `fecha_evento`, `veterinario`, `dosis`, `observaciones`, `fecha_proximo_evento` | `tipo_evento`: VACUNA / DESPARASITACION / ENFERMEDAD / CIRUGIA / OTRO |
| `gastos` | `id`, `animal_id` FK nullable, `categoria`, `descripcion`, `monto`, `fecha`, `notas` | `categoria`: ALIMENTACION / MEDICAMENTOS / TRASLADO / VETERINARIO / OTRO |
| `historial_clinico` | `id`, `animal_id` FK, `fecha`, `enfermedad`, `sintomas`, `tratamiento` | Tabla complementaria (no confundir con `eventos_sanitarios`) |
| `usuarios` | `id`, `nombre`, `pin` (hash SHA-256), `rol` | PIN nunca en texto plano |

### Añadir una migración

1. Incrementar `DATABASE_VERSION` en `DatabaseHelper.java`.
2. Agregar bloque en `onUpgrade()`:
```java
if (oldVersion < 13) {
    db.execSQL("ALTER TABLE animales ADD COLUMN nueva_col TEXT");
}
```
3. Nunca usar `DROP TABLE` sin respaldo — usar `RENAME TO _backup` + recrear + migrar datos.

### Acceso desde módulos nativos

```java
// Lectura
SQLiteDatabase db = DatabaseHelper.getInstance(context).getReadableDatabase();

// Escritura
SQLiteDatabase db = DatabaseHelper.getInstance(context).getWritableDatabase();
```

---

## 9. Paleta de diseño

Definida en `src/shared/theme/identity.ts` — **usar siempre estas constantes**, nunca colores hardcoded nuevos.

| Token | Valor | Uso |
|-------|-------|-----|
| `COLORS.primary` | `#07612d` | Verde principal — botones, headers, acentos |
| `#f4f8f0` | fondo suave verde | Backgrounds de pantallas |
| `#1c2b1d` | texto principal | Títulos y body text oscuro |
| `#e8f5ec` | verde muy claro | Fondos de chips, badges, tarjetas secundarias |
| `#c8dece` | borde verde suave | Bordes de inputs y tarjetas |
| `rgba(255,255,255,0.15)` | blanco translúcido | Botón "← Volver" sobre headers verdes |

**Botón "← Volver" estándar** (aplica a **todas** las pantallas):
```typescript
backButton: {
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 999,
  backgroundColor: 'rgba(255,255,255,0.15)',
},
backButtonText: {
  color: '#ffffff',
  fontSize: 14,
  fontFamily: FONTS.bold,
},
// Label siempre: "← Volver"
```

**Fuentes disponibles** (`FONTS.*`):
- `FONTS.bold` → `Poppins-Bold`
- `FONTS.semiBold` → `Poppins-SemiBold`
- `FONTS.regular` → `Poppins-Regular`

---

## 10. Qué NO hacer

| ❌ No hacer | ✅ Alternativa |
|-------------|---------------|
| Modificar lógica de negocio al añadir UI (spinners, estilos) | Solo agregar estado/render, no tocar las llamadas existentes |
| Usar `AsyncTask` en Java | `executor.execute(() -> { … })` |
| `overflow: 'hidden'` en contenedores de `TextInput` | Eliminarlo — bloquea el foco en Android |
| `keyboardType="numeric"` para campos con guiones (fechas) | `keyboardType="number-pad"` + función de formato |
| `NativeModules.ShareModule` | `NativeModules.AgroShareModule` (colisiona con módulo interno de RN) |
| `NativeModules.X ?? guard` como guard | `typeof X.method !== 'function'` — `NativeModules` devuelve `{}` no `null` |
| Guardar PINs o credenciales en texto plano | `PinSecurity.hashPin(pin)` (SHA-256) |
| Usar `ScrollView` anidado sin `nestedScrollEnabled` | Añadir `nestedScrollEnabled={true}` al scroll interior |
| Nombrar un módulo nativo igual que uno de RN | Verificar con `Object.keys(NativeModules)` antes de nombrar |
| Build incremental tras añadir módulo Java | `./gradlew clean assembleRelease` siempre |
| Colores hardcoded nuevos (`'#07612d'` repetido) | `COLORS.primary` desde `identity.ts` |
| Commits con cambios sin compilar | Verificar `npx tsc --noEmit` antes de commit |

---

## Contacto

**Autor:** Luis Ernesto Gómez Martínez  
**Institución:** TecNM Campus Zitácuaro  
**App ID:** `com.agroappreact`

---

*Última actualización: Sprint 4 — 2026-05-07*
