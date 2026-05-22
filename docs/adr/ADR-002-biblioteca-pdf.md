# ADR-002 — Biblioteca PDF para generación offline

| Campo | Valor |
|-------|-------|
| **ID** | ADR-002 |
| **Estado** | APROBADO |
| **Fecha de aprobación** | 22 de mayo de 2026 (revisión final con implementación completada) |
| **Autor** | Luis Ernesto Gómez Martínez |
| **Sprint** | Sprint 4 — Anexo A |

---

## Contexto

AgroApp necesita generar reportes PDF directamente en el dispositivo Android sin conexión a internet. Los reportes requeridos son:

- **RF014** — Reporte del Hato: inventario de animales activos con inversión total acumulada.
- **RF015** — Reporte por Animal: ficha individual con datos, historial clínico y gastos.
- **RF016** — Historial Clínico: eventos sanitarios cronológicos de un animal.

Restricciones del proyecto:
- `minSdk 24` (Android 7.0)
- `targetSdk 36`
- Sin conexión a internet en ganadería rural (offline-first)
- Sin dependencia de WebView (aumenta APK y complejidad)
- Licencia compatible con uso académico/comercial

---

## Opciones evaluadas

| Opción | Offline puro | Sin WebView | minSdk 24 | Resultado |
|--------|-------------|-------------|-----------|-----------|
| **iText7 Community 7.1.16 (LGPL)** | ✓ Sí | ✓ Sí | ✓ Sí | **SELECCIONADA E IMPLEMENTADA** |
| react-native-html-to-pdf | Parcial | ✗ No | ✓ Sí | Descartada |
| Android Print Framework | ✗ No | ✓ Sí | ✓ Sí | Descartada |
| PDFBox Android | ✓ Sí | ✓ Sí | Incierto | Descartada |

### Detalle de opciones descartadas

**react-native-html-to-pdf**
- Usa WebView internamente para renderizar HTML → peso adicional, comportamiento inconsistente.
- Renderizado offline parcial: requiere que los assets estén disponibles localmente.
- Sin control fino de layout de tablas, colores por fila ni saltos de página.

**Android Print Framework**
- Orientado a imprimir en impresoras físicas, no a generar archivos `.pdf` guardables.
- Requiere interacción del usuario para confirmar la impresión — no apto para generación automática.
- No produce un archivo en almacenamiento local directamente.

**PDFBox Android**
- Port no oficial de Apache PDFBox — soporte intermitente para `minSdk 24`.
- API de bajo nivel: no tiene abstracciones para tablas (`Table`, `Cell`) ni layout fluido.
- Comunidad pequeña y sin actualizaciones recientes al momento de evaluación.

---

## Decisión

**iText7 Community 7.1.16** mediante un módulo nativo Java propio (`PdfModule.java`).

Dependencias añadidas en `android/app/build.gradle`:

```groovy
implementation("com.itextpdf:kernel:7.1.16")
implementation("com.itextpdf:io:7.1.16")
implementation("com.itextpdf:layout:7.1.16")

packaging {
    resources {
        excludes += [
            'META-INF/BCKEY.DSA', 'META-INF/BCKEY.SF',
            'META-INF/LICENSE.md', 'META-INF/NOTICE.md',
            'META-INF/LICENSE', 'META-INF/NOTICE',
        ]
    }
}
```

> Los excludes evitan conflictos de META-INF con BouncyCastle que iText7 incluye transitivamente.

### Corrección de import (iText7 7.1.16)

```java
// ❌ incorrecto — package plural no existe en esta versión
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;

// ✅ correcto — package singular
import com.itextpdf.layout.property.TextAlignment;
import com.itextpdf.layout.property.UnitValue;
```

---

## Implementación

### Arquitectura del módulo

```
PdfModule.java          ← ReactContextBaseJavaModule, nombre "PdfModule"
PdfModulePackage.java   ← ReactPackage, registrado en MainApplication.kt
src/native/pdfModule.ts ← Bridge TypeScript con interfaz tipada y guard
```

### Métodos expuestos

| Método Java | Bridge TS | PDF generado |
|-------------|-----------|-------------|
| `generateHatoPdf()` | `pdfModule.generateHatoPdf()` | `hato_yyyyMMdd.pdf` |
| `generateAnimalPdf(double id)` | `pdfModule.generateAnimalPdf(id)` | `animal_[arete]_yyyyMMdd.pdf` |
| `generateHistorialPdf(double id)` | `pdfModule.generateHistorialPdf(id)` | `historial_[arete]_yyyyMMdd.pdf` |

### Ruta de almacenamiento

```java
File docsDir = context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS);
if (docsDir == null) docsDir = context.getFilesDir();  // fallback interno
File agroDir = new File(docsDir, "AgroApp");
```

Ruta resultante: `/storage/emulated/0/Android/data/com.agroappreact/files/Documents/AgroApp/`

### Paleta visual de los PDFs

| Elemento | Color | Valor hex |
|----------|-------|-----------|
| Header de tabla, título | Verde primario | `#07612d` → `DeviceRgb(7, 97, 45)` |
| Filas alternas | Verde muy suave | `#f4f8f0` → `DeviceRgb(244, 248, 240)` |
| Fila de total | Verde claro | `#e8f5ec` → `DeviceRgb(232, 245, 236)` |
| Texto en header | Blanco | `DeviceRgb(255, 255, 255)` |
| Texto secundario | Gris | `DeviceRgb(100, 100, 100)` |
| Footer | Gris claro | `DeviceRgb(150, 150, 150)` |

### Patrón de ejecución (sin AsyncTask)

```java
private final ExecutorService executor = Executors.newSingleThreadExecutor();

@ReactMethod
public void generateHatoPdf(Promise promise) {
    executor.execute(() -> {
        try {
            // …generación iText7…
            promise.resolve(rutaAbsoluta);
        } catch (Exception e) {
            promise.reject("PDF_ERROR", e.getMessage(), e);
        }
    });
}
```

---

## Resultado

- RF014, RF015 y RF016 implementados y funcionando en producción offline.
- APK probado en Android 7 (API 24) y Android 13 (API 33).
- Tiempo de generación típico: < 1 segundo para reportes con hasta 50 animales.
- Los PDFs se guardan localmente y son accesibles desde el explorador de archivos del dispositivo.

---

## Consecuencias

**Positivas:**
- API de alto nivel (`Table`, `Cell`, `Paragraph`, `Document`) simplifica el layout de tablas.
- Completamente offline — cero dependencias de red en tiempo de ejecución.
- Control total sobre colores, tipografías y estructura del documento.
- Licencia LGPL 3.0 compatible con el uso académico y sin distribución del código fuente de iText.

**Negativas:**
- Añade ~3–4 MB al APK (kernel + io + layout compilados con R8).
- El package correcto es `property` (singular), no `properties` — error silencioso en compilación si se usa el incorrecto.
- La clase `ShareModule` de React Native colisiona con nombres — el módulo de compartir debe llamarse `AgroShareModule` (ver ADR-003).

---

*Relacionado con: [ADR-003 — Estrategia Share Intent](ADR-003-share-intent.md)*
