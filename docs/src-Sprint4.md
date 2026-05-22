# AgroApp — Documentación `src/` Sprint 4
**Commits:** `93402d6` AnexoA → `b1ac463` AnexoF  
**Fecha:** 2026-05-07  
**Stack:** React Native 0.84.1 · TypeScript 5.8.3 · Java 21 · iText7 7.1.16 · SQLite nativo

---

## Índice

1. [Resumen ejecutivo del Sprint 4](#1-resumen-ejecutivo)
2. [Anexo A — Módulo PDF base + Reporte del Hato + Eliminación de eventos](#2-anexo-a)
3. [Anexo B — Reporte por Animal + botón PDF en DetalleAnimal](#3-anexo-b)
4. [Anexo C — Historial clínico exportable + generateHistorialPdf reescrito](#4-anexo-c)
5. [Anexo D — Módulo de compartir (ShareModule) + activación real del botón Compartir](#5-anexo-d)
6. [Anexo E — Filtros de gastos (FiltroGastosModal + CostosModule)](#6-anexo-e)
7. [Anexo F — ActivityIndicator en CalendarioSanitario y GestionGastos](#7-anexo-f)
8. [Árbol de archivos nuevos / modificados](#8-árbol-de-archivos)
9. [Módulos nativos TypeScript](#9-módulos-nativos-typescript)
10. [Pantallas de Reportes](#10-pantallas-de-reportes)
11. [Componentes modificados](#11-componentes-modificados)
12. [Navegación](#12-navegación)

---

## 1. Resumen ejecutivo

El Sprint 4 añade el sistema completo de **generación y compartición de reportes PDF** (offline, sin red) y los **filtros avanzados de gastos**. Todo el procesamiento de PDF ocurre en Java mediante la librería iText7 Community 7.1.16 y se expone a React Native a través de módulos nativos propios.

| Anexo | Funcionalidad principal |
|-------|------------------------|
| A | `PdfModule.java` + `generateHatoPdf` + pantallas de reportes base + eliminación de eventos sanitarios |
| B | `generateAnimalPdf` + `ReporteAnimalScreen` + botón PDF en `DetalleAnimalScreen` |
| C | `generateHistorialPdf` (reescrito a spec final) + exportación desde `HistorialClinico` |
| D | `ShareModule` (MediaStore en Android 10+) + compartición real desde botones |
| E | `CostosModule.getGastosFiltrados` + `FiltroGastosModal` + `GestionGastosScreen` refactorizado |
| F | `ActivityIndicator` en `CalendarioSanitario` y `GestionGastosScreen` |

---

## 2. Anexo A

### 2.1 Dependencias Android añadidas

**`android/app/build.gradle`**

```groovy
implementation("com.itextpdf:kernel:7.1.16")
implementation("com.itextpdf:io:7.1.16")
implementation("com.itextpdf:layout:7.1.16")

packaging {
    resources {
        excludes += ['META-INF/BCKEY.DSA', 'META-INF/BCKEY.SF',
                     'META-INF/LICENSE.md', 'META-INF/NOTICE.md', ...]
    }
}
```

### 2.2 PdfModule.java — `generateHatoPdf`

**Ubicación:** `android/…/pdf/PdfModule.java`  
**Nombre nativo:** `"PdfModule"` — registrado vía `PdfModulePackage` en `MainApplication.kt`

```
executor (hilo único)
  └─ getExternalFilesDir(DIRECTORY_DOCUMENTS)/AgroApp/hato_yyyyMMdd.pdf
  └─ SELECT id, numero_arete, especie, sexo, estado, peso_actual
     FROM animales WHERE estado = 'ACTIVO' ORDER BY numero_arete
  └─ por cada animal: SELECT SUM(monto) FROM gastos WHERE animal_id = ?
  └─ iText7 Document (PageSize.A4)
       ├─ Título: "AgroApp — Inventario del Hato" (verde #07612d, centrado)
       ├─ Subtítulo: "Generado: dd/MM/yyyy HH:mm"
       ├─ Tabla 6 col: Arete|Especie|Sexo|Estado|Peso kg|Inversión MXN
       │    Header: fondo #07612d texto blanco
       │    Filas: alternas blanco / #f4f8f0
       ├─ Si 0 animales: "Sin animales activos registrados."
       └─ Footer: "AgroApp v1.0 — Offline-First — com.agroappreact"
  └─ promise.resolve(rutaAbsoluta)
```

**Helper privado compartido:** `addSectionTitle(doc, title, bgColor, textColor)` — agrega banda de color con texto bold, reutilizado por los tres métodos.

**Helper privado:** `safe(String value)` — devuelve `"—"` si el valor es null o vacío.

### 2.3 src/native/pdfModule.ts — interfaz TypeScript

```typescript
interface PdfModuleInterface {
  generateHatoPdf(): Promise<string>;        // ruta absoluta del PDF
  generateAnimalPdf(animalId: number): Promise<string>;
  generateHistorialPdf(animalId: number): Promise<string>;
}
```

**Patrón guard:** cada método valida `typeof method === 'function'` en tiempo de llamada. Si `PdfModule` es null o el método no existe, retorna `Promise.reject(new Error('PdfModule.<method> no disponible…'))`.

```typescript
export const pdfModule: PdfModuleInterface = PdfModule ?? guard;
```

### 2.4 Eliminación de eventos sanitarios

**`AgroBridgeModule.java`** — método añadido:
```java
@ReactMethod
public void eliminarEventoSanitario(double idDouble, Promise promise) {
    int id = (int) idDouble;
    boolean eliminado = eventoSanitarioDAO.eliminarEvento(id);
    promise.resolve(eliminado);
}
```

**`BridgeModule.ts`** — export añadido:
```typescript
export const eliminarEventoSanitario = (id: number): Promise<boolean> =>
  getBridge().eliminarEventoSanitario(id);
```

**`EventoDetailModal.tsx`** — prop nueva + botón eliminar:

```typescript
interface EventoDetailModalProps {
  // …props existentes…
  onDelete?: (evento: any) => void;   // ← NUEVO
}
```

El botón rojo aparece solo si `onDelete` está definido. Muestra `Alert.alert` con opciones "Cancelar" / "Eliminar (destructive)" antes de ejecutar.

**`HealthScreen.tsx`** — handler `onDelete` pasado al modal:
```typescript
onDelete={async (e) => {
  try { await eliminarEventoSanitario(e.id); }
  catch (_) { /* silenciar */ }
  finally { setDetailEvento(null); void loadEvents(); }
}}
```

### 2.5 Pantallas de reportes base

| Archivo | Creado | Descripción |
|---------|--------|-------------|
| `ReportesMenuScreen.tsx` | ✓ | Menú raíz con tarjetas "Reporte del Hato" y "Reporte por Animal" |
| `ReporteHatoScreen.tsx` | ✓ | Genera + comparte el PDF del hato completo |

**`AppNavigator.tsx`** — ruta `'reports'` actualizada para usar `ReportesMenuScreen` en lugar del placeholder `ReportsScreen`.

---

## 3. Anexo B

### 3.1 PdfModule.java — `generateAnimalPdf`

Firma: `public void generateAnimalPdf(double animalIdDouble, Promise promise)`

```
Flujo:
  1. SELECT numero_arete, especie, sexo, raza, estado, peso_actual, fecha_ingreso
     FROM animales WHERE id = ?
     → Si no existe: promise.reject("PDF_ERROR", "Animal no encontrado…")

  2. SELECT tipo_evento, descripcion, fecha_evento, veterinario,
            dosis, observaciones
     FROM eventos_sanitarios WHERE animal_id = ? ORDER BY fecha_evento DESC

  3. SELECT categoria, descripcion, monto, fecha
     FROM gastos WHERE animal_id = ? ORDER BY fecha DESC
     + SELECT SUM(monto) FROM gastos WHERE animal_id = ?  → totalGastos

  Archivo: Documents/AgroApp/animal_[arete_safe]_yyyyMMdd.pdf
  (arete sanitizado: replaceAll("[^a-zA-Z0-9]", "_"))

  Documento:
    Título: "AgroApp — Ficha del Animal"
    Subtítulo: "Arete: X | Generado: dd/MM/yyyy HH:mm"

    SECCIÓN 1 — Datos del Animal (tabla 2 col campo/valor)
      Arete, Especie, Sexo, Raza, Estado,
      "Peso actual: X.XX kg", "Fecha de ingreso: YYYY-MM-DD"

    SECCIÓN 2 — Historial Clínico (5 col)
      Fecha | Tipo | Descripcion | Veterinario | Observaciones
      Si vacío: "Sin eventos clinicos registrados."

    SECCIÓN 3 — Resumen de Gastos (4 col)
      Categoria | Descripcion | Monto MXN | Fecha
      Fila final: "Inversion Total  $X,XXX.XX MXN" (negrita, fondo #e8f5ec)
      Si vacío: "Sin gastos registrados."
```

### 3.2 ReporteAnimalScreen.tsx

**Props:** `{ animalId: number; arete: string; onBack: () => void }`

**Estados:**
- `cargando: boolean` — mientras genera el PDF
- `rutaPdf: string | null` — ruta del archivo generado
- `error: string | null` — mensaje de error
- `compartiendo: boolean` — mientras comparte

**Lógica de generación:**
```typescript
const generarPdf = () => {
  setCargando(true); setError(null);
  pdfModule.generateAnimalPdf(animalId)
    .then(r => setRutaPdf(r))
    .catch(e => setError(e.message || 'Error al generar PDF'))
    .finally(() => setCargando(false));
};
```

**Lógica de compartición:**
```typescript
const compartirPdf = async () => {
  if (!rutaPdf) return;
  setCompartiendo(true);
  try { await shareModule.sharePdf(rutaPdf, `Reporte Animal #${arete} — AgroApp`); }
  catch (e) { Alert.alert('Error al compartir', e.message); }
  finally { setCompartiendo(false); }
};
```

**UI:**
- Chip verde oscuro con `ARETE #<valor>`
- Tarjeta de info: lista de 4 ítems que incluye el PDF
- Overlay `ActivityIndicator` mientras `cargando`
- Tarjeta verde de éxito con ruta seleccionable + botón "↑ Compartir PDF"
- Tarjeta roja de error con mensaje
- Botón principal "📄 Generar PDF Individual"

### 3.3 DetalleAnimalScreen.tsx — botón PDF

**Prop añadida:**
```typescript
onOpenReporteAnimal?: (animalId: number, arete: string) => void;
```

**Botón en actionBar:**
```tsx
<Pressable style={styles.pdfButton}
  onPress={() => onOpenReporteAnimal?.(animalId, currentAnimal.arete)}>
  <Text style={styles.pdfButtonText}>📊 Ver Reporte PDF</Text>
</Pressable>
```

El `actionBar` se reestructuró: el botón PDF ocupa toda la fila superior; "✏️ Editar" y "+ Registrar Evento" se colocan en `actionRow` horizontal debajo.  
`paddingBottom` del body: `200 → 260` para acomodar el tercer botón.

### 3.4 AnimalesNavigator.tsx — ruta reporteAnimal

```typescript
type AnimalRoute =
  // …rutas existentes…
  | { name: 'reporteAnimal'; animalId: number; arete: string };
```

```tsx
if (route.name === 'reporteAnimal') {
  return (
    <ReporteAnimalScreen
      animalId={route.animalId}
      arete={route.arete}
      onBack={() => setRoute({
        name: 'detail', animalId: route.animalId, refreshToken: Date.now()
      })}
    />
  );
}
```

`onOpenReporteAnimal` se pasa a `DetalleAnimalScreen`:
```tsx
onOpenReporteAnimal={(animalId, arete) =>
  setRoute({ name: 'reporteAnimal', animalId, arete })}
```

---

## 4. Anexo C

### 4.1 PdfModule.java — `generateHistorialPdf` (spec final)

Firma: `public void generateHistorialPdf(double animalIdDouble, Promise promise)`

```
1. SELECT numero_arete, especie FROM animales WHERE id = ?

2. SELECT tipo_evento, descripcion, fecha_evento,
          veterinario, dosis, observaciones
   FROM eventos_sanitarios WHERE animal_id = ? ORDER BY fecha_evento DESC

Archivo: Documents/AgroApp/historial_[arete_safe]_yyyyMMdd.pdf

Documento:
  Título: "Historial Clinico — Arete [arete]"
  Subtítulo: "Especie: [especie]  |  Generado: dd/MM/yyyy"

  Tabla única (5 col):
    Fecha | Tipo Evento | Descripcion | Veterinario | Observaciones
    Fecha centrada, resto left-aligned
    Filas alternas blanco / #f4f8f0

  Si vacío: "Sin eventos clinicos registrados para este animal."
  Footer: "AgroApp v1.0 — com.agroappreact"
```

> **Nota de evolución:** la implementación anterior (pre-AnexoC) tenía 2 secciones (eventos_sanitarios + historial_clinico). La spec final simplifica a una sola tabla sobre `eventos_sanitarios`, alineándose con lo que muestra `HistorialClinicoDAO.obtenerHistorialCompleto()`.

### 4.2 HistorialClinico.tsx — exportación PDF

**Imports añadidos:** `ActivityIndicator`, `Alert` + `pdfModule`

**Estados nuevos:**
```typescript
const [exportando, setExportando] = useState(false);
const [rutaExportada, setRutaExportada] = useState<string | null>(null);
```

**Handler:**
```typescript
const exportarHistorialPdf = async () => {
  setExportando(true);
  try {
    const ruta = await pdfModule.generateHistorialPdf(animalId);
    setRutaExportada(ruta);
  } catch (e: any) {
    Alert.alert('Error', e.message || 'No se pudo exportar');
  } finally {
    setExportando(false);
  }
};
```

**UI insertada entre header y FlatList:**
```
┌─────────────────────────────────────────────────┐
│ [📄 Exportar PDF]   PDF listo: historial_….pdf  │
└─────────────────────────────────────────────────┘
```
- Barra blanca con `borderBottom` sutil
- Mientras exporta: `ActivityIndicator size="small"` dentro del botón, `opacity: 0.6`
- `rutaExportada`: muestra solo el nombre de archivo (`split('/').pop()`)

**La lógica de carga de historial (`useHistorialClinico`) no se modificó.**

### 4.3 ReportesMenuScreen.tsx — selector de animal

`SubView` ampliado: `'menu' | 'hato' | 'selector' | 'reporte_animal'`

**`SelectorAnimalView`** — componente interno:
```typescript
useEffect(() => {
  NativeModules.AgroBridgeModule.obtenerAnimales()
    .then((lista: AnimalItem[]) => setAnimales(lista))
    .catch(() => Alert.alert('Error', '…'))
    .finally(() => setCargando(false));
}, []);
```
- `FlatList` con arete, especie y badge de estado (verde/naranja/rojo)
- Al seleccionar un animal → `setAnimalSeleccionado(animal)` + `setView('reporte_animal')`
- `view === 'reporte_animal'` renderiza `<ReporteAnimalScreen>` embedded

**Card "Reporte por Animal"** deja de estar `disabled` y navega a `'selector'`.

---

## 5. Anexo D

### 5.1 ShareModule.java

**Package:** `com.agroappreact.share`  
**Nombre nativo:** `"AgroShareModule"` ← nombre único para evitar conflicto con `ShareModule` interno de React Native.  
**Registrado vía:** `ShareModulePackage` → `MainApplication.kt`

**Lógica de `sharePdf(filePath, title, promise)`:**

```
1. Verificar File.exists() → reject si no

2. Obtener Activity → reject si null

3. Android 10+ (Build.VERSION_CODES.Q):
   └─ copiarAMediaStore(file):
        ContentValues {
          DISPLAY_NAME = file.getName(),
          MIME_TYPE    = "application/pdf",
          RELATIVE_PATH = DIRECTORY_DOWNLOADS + "/AgroApp",
          IS_PENDING   = 1
        }
        → resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
        → Copiar bytes: FileInputStream(file) → resolver.openOutputStream(uri)
        → IS_PENDING = 0  (marcar como listo)
        → retorna URI pública del sistema

   Android 7-9:
   └─ FileProvider.getUriForFile(context, "com.agroappreact.fileprovider", file)

4. Intent ACTION_SEND:
   setType("application/pdf")
   EXTRA_STREAM = shareUri
   EXTRA_SUBJECT = title
   EXTRA_TEXT = title          ← evita "mensaje vacío" en WhatsApp
   setClipData(ClipData.newRawUri(title, shareUri))  ← propagación de permisos Android 10+
   addFlags(FLAG_GRANT_READ_URI_PERMISSION | FLAG_GRANT_WRITE_URI_PERMISSION)

5. createChooser → activity.startActivity
6. promise.resolve(filePath)
```

> **Por qué MediaStore:** En Android 10+ (scoped storage), los archivos de `getExternalFilesDir()` son privados de la app. Aunque FileProvider genere un `content://` válido, WhatsApp y otras apps con `targetSdk ≥ 30` no pueden leerlos. La URI de `MediaStore.Downloads` es pública y accesible por cualquier app sin permisos adicionales.

> **Por qué ClipData:** `FLAG_GRANT_READ_URI_PERMISSION` en el Intent solo no propaga permisos al app destino en el chooser. `setClipData()` permite que el sistema gestione automáticamente los permisos URI.

> **Por qué renombrar a `AgroShareModule`:** React Native ya tiene un módulo interno llamado `ShareModule`. Al usar el mismo nombre, el interno tomaba precedencia y `NativeModules.ShareModule` no tenía el método `sharePdf`.

### 5.2 file_paths.xml

```xml
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <cache-path name="camera_cache" path="." />
    <files-path name="internal_files" path="." />
    <external-files-path name="external_documents" path="Documents/" />
    <external-files-path name="agroreports" path="Documents/AgroApp/" />
</paths>
```

Necesario para Android 7-9 donde FileProvider se usa como fallback.

### 5.3 src/native/shareModule.ts

```typescript
const { AgroShareModule } = NativeModules;

export const shareModule: ShareModuleInterface = {
  sharePdf(filePath: string, title: string): Promise<string> {
    if (!AgroShareModule || typeof AgroShareModule.sharePdf !== 'function') {
      return Promise.reject(new Error('AgroShareModule no disponible…'));
    }
    return AgroShareModule.sharePdf(filePath, title) as Promise<string>;
  },
};
```

**Patrón de validación en tiempo de llamada** (no de carga): evita el error `"undefined is not a function"` cuando `NativeModules` devuelve `{}` en lugar de `null` para módulos no encontrados.

### 5.4 Integración en pantallas de reportes

**`ReporteHatoScreen.tsx`** y **`ReporteAnimalScreen.tsx`** — reemplazo del stub:

```typescript
// ❌ Stub anterior (no funcionaba en Android 10+)
Share.share({ url: `file://${rutaPdf}` })

// ✅ Implementación real
const compartirPdf = async () => {
  setCompartiendo(true);
  try {
    await shareModule.sharePdf(rutaPdf!, `Reporte … — AgroApp`);
  } catch (e: any) {
    Alert.alert('Error al compartir', e.message);
  } finally { setCompartiendo(false); }
};
```

El botón "↑ Compartir PDF" muestra `ActivityIndicator size="small"` mientras `compartiendo === true`.

---

## 6. Anexo E

### 6.1 CostosModule.java

**Package:** `com.agroappreact.costs`  
**Nombre nativo:** `"CostosModule"`  
**Registrado vía:** `CostosModulePackage` → `MainApplication.kt`

```java
// Constante de consulta base
private static final String BASE_SELECT =
    "SELECT id, animal_id, monto, categoria, descripcion, fecha, notas FROM gastos";
```

**Métodos:**

| Método | SQL | Notas |
|--------|-----|-------|
| `getGastos()` | `BASE_SELECT ORDER BY fecha DESC` | Todos los gastos |
| `getGastosByAnimal(animalId)` | `… WHERE animal_id = ? ORDER BY fecha DESC` | Gastos de un animal |
| `getGastosFiltrados(fechaDesde, fechaHasta, categoria)` | WHERE dinámico | Ver abajo |

**`getGastosFiltrados` — WHERE dinámico:**
```java
StringBuilder q = new StringBuilder(BASE_SELECT + " WHERE 1=1");
List<String> args = new ArrayList<>();

if (!TextUtils.isEmpty(fechaDesde)) { q.append(" AND fecha >= ?"); args.add(fechaDesde); }
if (!TextUtils.isEmpty(fechaHasta)) { q.append(" AND fecha <= ?"); args.add(fechaHasta); }
if (!TextUtils.isEmpty(categoria))  { q.append(" AND categoria = ?"); args.add(categoria); }

q.append(" ORDER BY fecha DESC");
```

`TextUtils.isEmpty()` maneja correctamente tanto `null` como `""` — el bridge JS puede pasar ambos valores cuando no hay filtro.

**Helper `cursorToGasto(Cursor c)`:** serializa las 7 columnas a `WritableMap`. `animal_id` y `notas` usan `putNull()` si la columna es NULL en BD.

### 6.2 src/native/CostosModule.ts

```typescript
interface CostosNativeModule {
  getGastos(): Promise<GastoModel[]>;
  getGastosByAnimal(animalId: number): Promise<GastoModel[]>;
  getGastosFiltrados(
    fechaDesde: string | null,
    fechaHasta: string | null,
    categoria: string | null,
  ): Promise<GastoModel[]>;
}
```

`CategoriaGasto | null` del lado TS se pasa como `string | null` al bridge (el enum es `string` en runtime).  
Cada método aplica el mismo patrón de validación `typeof method !== 'function'`.

### 6.3 FiltroGastosModal.tsx

**Props:**
```typescript
export interface FiltroGastosParams {
  fechaDesde: string | null;   // 'YYYY-MM-DD' o null
  fechaHasta: string | null;
  categoria:  CategoriaGasto | null;
}

interface FiltroGastosModalProps {
  visible:   boolean;
  onClose:   () => void;
  onAplicar: (f: FiltroGastosParams) => void;
}
```

**UI (bottom sheet, `animationType="slide"`):**

```
┌─ Header ──────────────────────── [✕] ─┐
│ RANGO DE FECHAS                        │
│ [Desde YYYY-MM-DD           ]          │
│ [Hasta YYYY-MM-DD           ]          │
│                                        │
│ CATEGORÍA                              │
│ [Todas][🥕 Alim.][💊 Med.][🚚...] ←→  │
├──────────────────────────────────────  │
│ [Limpiar]         [Aplicar filtros]    │
└────────────────────────────────────────┘
```

**Chips de categoría:**
- "Todas" → `setCategoria(null)`
- Cada `CategoriaGasto` con su emoji de `CATEGORIA_GASTO_LABELS`
- Chip activo: fondo `#07612d`, texto blanco
- Chip inactivo: borde `#07612d`, fondo blanco

**Validación:**
```typescript
if (desde && hasta && hasta < desde) {
  Alert.alert('Rango inválido', 'La fecha "Hasta" no puede ser anterior…');
  return; // no cierra el modal
}
```

**`handleLimpiar`:** resetea estados + llama `onAplicar({ null, null, null })` + cierra.  
**`handleAplicar`:** strings vacíos → `null` antes de llamar `onAplicar`.

### 6.4 GestionGastosScreen.tsx — refactorización

**Cambios de lógica de carga:**

```typescript
// Antes: llamada directa, sin useCallback
const cargarGastos = async () => {
  const resultado = await AgroBridgeModule.obtenerTodosGastos();
  …
};
useEffect(() => { void cargarGastos(); }, []);

// Después: useCallback con filtros como dependencia
const cargarGastos = useCallback(async () => {
  setLoading(true);
  try {
    const data = await CostosModule.getGastosFiltrados(
      filtros.fechaDesde, filtros.fechaHasta, filtros.categoria
    );
    setGastos(Array.isArray(data) ? data : []);
  } catch (e: any) {
    Alert.alert('Error', e?.message || '…');
  } finally { setLoading(false); }
}, [filtros]);                      // ← se re-ejecuta al cambiar filtros

useEffect(() => { void cargarGastos(); }, [cargarGastos]);
```

**Nuevos elementos de UI:**

1. **Botón "⊿ Filtrar"** en el header (derecha), con badge rojo si `filtrosActivos`
2. **Banner de filtros activos** — muestra valores aplicados + botón "Limpiar ✕"
3. **Estado vacío diferenciado** — 🔍 "Sin resultados" con filtros, 📭 sin gastos sin filtros
4. **`FiltroGastosModal`** al final del JSX

```typescript
const filtrosActivos =
  filtros.fechaDesde !== null ||
  filtros.fechaHasta !== null ||
  filtros.categoria  !== null;
```

---

## 7. Anexo F

### 7.1 CalendarioSanitario.tsx

El componente ya tenía `const { eventsByDate, loading } = useCalendarioSanitario(year, month)`. Se reutilizó `loading` directamente sin añadir estado duplicado.

**Cambio:**
```tsx
// Antes
{loading ? <Text>Cargando...</Text> : <FlatList … />}

// Después
{loading ? (
  <View style={styles.loaderWrap}>
    <ActivityIndicator size="large" color="#07612d" />
  </View>
) : (
  <FlatList … />
)}
```

Estilo añadido: `loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 32 }`

### 7.2 GestionGastosScreen.tsx

**Dos patrones de indicador:**

```typescript
// 1. Carga inicial (lista vacía) — pantalla completa centrada
if (loading && gastos.length === 0) {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#07612d" />
    </View>
  );
}

// 2. Recarga por cambio de filtros (lista ya visible) — overlay superpuesto
{loading && gastos.length > 0 && (
  <ActivityIndicator size="large" color="#07612d" style={styles.loaderOverlay} />
)}
```

El overlay usa `position: 'absolute', top/left/right/bottom: 0` — el usuario ve la lista anterior mientras los datos nuevos llegan.

---

## 8. Árbol de archivos

```
src/
├── components/
│   └── EventoDetailModal.tsx          ★ MODIFICADO — prop onDelete + botón eliminar
│
├── features/
│   ├── animals/
│   │   └── screens/
│   │       └── HistorialClinico.tsx   ★ MODIFICADO — exportar PDF + ActivityIndicator
│   │
│   ├── costs/
│   │   ├── components/
│   │   │   └── FiltroGastosModal.tsx  ✦ NUEVO — filtros de gastos
│   │   └── screens/
│   │       └── GestionGastosScreen.tsx ★ MODIFICADO — filtros + CostosModule + ActivityIndicator
│   │
│   ├── health/
│   │   └── screens/
│   │       └── HealthScreen.tsx       ★ MODIFICADO — onDelete en EventoDetailModal
│   │
│   └── reports/
│       └── screens/
│           ├── ReportesMenuScreen.tsx  ✦ NUEVO — menú + selector de animal
│           ├── ReporteHatoScreen.tsx   ✦ NUEVO — generar + compartir PDF hato
│           └── ReporteAnimalScreen.tsx ✦ NUEVO — generar + compartir PDF animal
│
├── native/
│   ├── pdfModule.ts      ✦ NUEVO — interfaz PdfModule (3 métodos)
│   ├── shareModule.ts    ✦ NUEVO — interfaz AgroShareModule
│   ├── CostosModule.ts   ✦ NUEVO — interfaz CostosModule (filtros)
│   └── BridgeModule.ts   ★ MODIFICADO — eliminarEventoSanitario añadido
│
├── navigation/
│   ├── AppNavigator.tsx          ★ MODIFICADO — ruta 'reports' → ReportesMenuScreen
│   └── AnimalesNavigator.tsx     ★ MODIFICADO — ruta 'reporteAnimal' añadida
│
└── screens/
    ├── animales/
    │   └── DetalleAnimalScreen.tsx  ★ MODIFICADO — botón "📊 Ver Reporte PDF"
    └── sanitarios/
        └── CalendarioSanitario.tsx  ★ MODIFICADO — ActivityIndicator reemplaza texto

android/app/src/main/java/com/agroappreact/
├── bridge/
│   └── AgroBridgeModule.java      ★ MODIFICADO — eliminarEventoSanitario
├── costs/
│   ├── CostosModule.java          ✦ NUEVO — getGastos/ByAnimal/Filtrados
│   └── CostosModulePackage.java   ✦ NUEVO
├── pdf/
│   ├── PdfModule.java             ✦ NUEVO — generateHatoPdf/AnimalPdf/HistorialPdf
│   └── PdfModulePackage.java      ✦ NUEVO
└── share/
    ├── ShareModule.java           ✦ NUEVO — sharePdf con MediaStore/FileProvider
    └── ShareModulePackage.java    ✦ NUEVO
```

---

## 9. Módulos nativos TypeScript

### pdfModule.ts

```typescript
// src/native/pdfModule.ts
interface PdfModuleInterface {
  generateHatoPdf(): Promise<string>;
  generateAnimalPdf(animalId: number): Promise<string>;
  generateHistorialPdf(animalId: number): Promise<string>;
}

// Guard en tiempo de carga
const guard: PdfModuleInterface = {
  generateHatoPdf:      () => unavailable('generateHatoPdf'),
  generateAnimalPdf:    () => unavailable('generateAnimalPdf'),
  generateHistorialPdf: () => unavailable('generateHistorialPdf'),
};

export const pdfModule: PdfModuleInterface = PdfModule ?? guard;
```

### shareModule.ts

```typescript
// src/native/shareModule.ts
// IMPORTANTE: usa NativeModules.AgroShareModule (no ShareModule)
// para evitar conflicto con el módulo interno de React Native

const { AgroShareModule } = NativeModules;

export const shareModule: ShareModuleInterface = {
  sharePdf(filePath, title) {
    if (!AgroShareModule || typeof AgroShareModule.sharePdf !== 'function')
      return Promise.reject(new Error('AgroShareModule no disponible…'));
    return AgroShareModule.sharePdf(filePath, title);
  },
};
```

### CostosModule.ts

```typescript
// src/native/CostosModule.ts
export const CostosModule = {
  getGastos(): Promise<GastoModel[]>,
  getGastosByAnimal(animalId: number): Promise<GastoModel[]>,
  getGastosFiltrados(
    fechaDesde: string | null,
    fechaHasta: string | null,
    categoria: CategoriaGasto | null,
  ): Promise<GastoModel[]>,
};
```

---

## 10. Pantallas de Reportes

### Flujo completo desde la tab Reportes

```
Tab Reportes
  └─ ReportesMenuScreen (view: 'menu')
       ├─ Card "Reporte del Hato"  → view: 'hato' → ReporteHatoView
       │                                  └─ [Generar PDF] → pdfModule.generateHatoPdf()
       │                                  └─ [Compartir PDF] → shareModule.sharePdf()
       │
       └─ Card "Reporte por Animal" → view: 'selector' → SelectorAnimalView
                                          └─ FlatList animales
                                          └─ tap → view: 'reporte_animal' → ReporteAnimalScreen
                                                        └─ [Generar PDF] → pdfModule.generateAnimalPdf(id)
                                                        └─ [Compartir PDF] → shareModule.sharePdf()
```

### Flujo desde DetalleAnimalScreen

```
AnimalesNavigator
  └─ DetalleAnimalScreen
       └─ [📊 Ver Reporte PDF]
            └─ onOpenReporteAnimal(animalId, arete)
                 └─ route: 'reporteAnimal'
                      └─ ReporteAnimalScreen
                           └─ [Generar PDF] → pdfModule.generateAnimalPdf(id)
                           └─ [Compartir PDF] → shareModule.sharePdf()
```

### Flujo desde HistorialClinico

```
HistorialClinico
  └─ [📄 Exportar PDF]  ← debajo del header
       └─ pdfModule.generateHistorialPdf(animalId)
            └─ muestra rutaExportada (nombre de archivo)
```

### Estados de UI en pantallas de generación

```
Inicial    → Descripción del contenido + botón "Generar PDF"
Cargando   → ActivityIndicator large #07612d + botón disabled
Éxito      → Tarjeta verde ✅ con ruta seleccionable
               + botón "↑ Compartir PDF" (con ActivityIndicator mientras comparte)
Error      → Tarjeta roja ⚠️ con mensaje + botón habilitado para reintentar
```

---

## 11. Componentes modificados

### EventoDetailModal.tsx

```typescript
// Props actualizadas
interface EventoDetailModalProps {
  visible: boolean;
  evento: any;
  onClose: () => void;
  onEdit?: (evento: any) => void;
  onDelete?: (evento: any) => void;  // ← NUEVO Sprint 4
  arete?: string;
}
```

**Sección `actions` — 3 botones (orden):**
1. `onEdit` → "✎ Modificar" — fondo `COLORS.primary`
2. `onDelete` → "🗑 Eliminar" — fondo `#fff0f0`, borde `#e53935`, texto rojo — **solo si prop definida**
3. Siempre → "Cerrar" — fondo `#f0f0f0`

El botón Eliminar muestra `Alert.alert` con:
- Texto: *"¿Estás seguro de que deseas eliminar este evento sanitario? Esta acción no se puede deshacer."*
- Opción "Eliminar" con `style: 'destructive'`

---

## 12. Navegación

### AppNavigator.tsx

```typescript
// Ruta 'reports' actualizada
if (route === 'reports') {
  return wrapProtectedScreen(
    <ReportesMenuScreen onBack={() => navigate('home')} />
    // Antes renderizaba: <ReportsScreen onBack={() => navigate('home')} />
  );
}
```

### AnimalesNavigator.tsx

```typescript
type AnimalRoute =
  | { name: 'list' }
  | { name: 'register' }
  | { name: 'detail'; animalId: number; refreshToken: number }
  | { name: 'historial'; animalId: number }
  | { name: 'registerEvent'; animalId: number }
  | { name: 'edit'; animal: AnimalModel }
  | { name: 'reporteAnimal'; animalId: number; arete: string }; // ← NUEVO
```

`DetalleAnimalScreen` recibe:
```typescript
onOpenReporteAnimal={(animalId, arete) =>
  setRoute({ name: 'reporteAnimal', animalId, arete })}
```

`ReporteAnimalScreen` regresa al detalle con `refreshToken: Date.now()`.

---

## Notas técnicas destacadas

### iText7 — paquete correcto en Android
```java
// ❌ incorrecto (lo que apareció primero)
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;

// ✅ correcto en iText7 7.1.16
import com.itextpdf.layout.property.TextAlignment;  // singular
import com.itextpdf.layout.property.UnitValue;
```

### Conflicto de nombre ShareModule
React Native registra internamente un módulo llamado `"ShareModule"`. Nombrar el módulo personalizado igual provoca que `NativeModules.ShareModule` apunte al interno de RN (sin método `sharePdf`). Solución: `getName()` retorna `"AgroShareModule"`.

### Caché de Gradle
Módulos recién añadidos pueden no compilarse en builds incrementales (tasks "up-to-date"). Si un módulo nativo no aparece en `NativeModules`, ejecutar:
```bash
cd android && ./gradlew clean assembleRelease
```

### Patrón de validación en tiempo de llamada
Preferible a `NativeModules.Foo ?? guard` porque `NativeModules` puede devolver `{}` (truthy) en lugar de `null` para módulos no encontrados:
```typescript
export const shareModule = {
  sharePdf(filePath, title) {
    if (!AgroShareModule || typeof AgroShareModule.sharePdf !== 'function')
      return Promise.reject(new Error('…'));
    return AgroShareModule.sharePdf(filePath, title);
  }
};
```
