# ADR-003 — Estrategia Share Intent para archivos PDF

| Campo | Valor |
|-------|-------|
| **ID** | ADR-003 |
| **Estado** | APROBADO |
| **Fecha de aprobación** | 20 de mayo de 2026 |
| **Autor** | Luis Ernesto Gómez Martínez |
| **Sprint** | Sprint 4 — Anexo D |

---

## Contexto

Una vez generados los PDFs por `PdfModule` (ADR-002), el usuario necesita compartirlos hacia WhatsApp, Telegram, Gmail u otras apps del dispositivo. Se requiere que el Intent funcione en:

- Android 7–9 (API 24–28): scoped storage no aplicado.
- Android 10+ (API 29+): scoped storage activo — restricciones en acceso a archivos de terceros.

Problema detectado durante desarrollo: al usar `file://` URIs o FileProvider solo, WhatsApp mostraba el mensaje **"El mensaje no contiene ningún dato"** y no adjuntaba el archivo.

---

## Opciones evaluadas

| Opción | Android 7–9 | Android 10+ | WhatsApp | Complejidad |
|--------|-------------|-------------|----------|-------------|
| `file://` URI directo | ✓ | ✗ (`FileUriExposedException`) | ✗ | Baja |
| FileProvider únicamente | ✓ | Parcial | ✗ en 10+ | Media |
| `MediaStore.Downloads` + FileProvider fallback | ✓ | ✓ | ✓ | Media-alta |
| React Native `Share.share({ url: 'file://…' })` | Parcial | ✗ | ✗ | Baja |

### Por qué `file://` URI falla en Android 10+

Los archivos de `getExternalFilesDir()` son privados de la app. Aunque FileProvider genera un `content://` válido, aplicaciones con `targetSdk ≥ 30` (WhatsApp, Telegram, Gmail) aplican scoped storage y **no pueden leer** desde `/Android/data/<package>/` aunque tengan el permiso del Intent.

### Por qué `FLAG_GRANT_READ_URI_PERMISSION` solo no es suficiente

El flag en el Intent propaga permisos al destinatario directo, pero **no al app seleccionado desde un `createChooser()`**. Sin `ClipData`, el sistema no puede rastrear la URI al destinatario final y bloquea el acceso silenciosamente.

---

## Decisión

**Estrategia dual según versión de Android:**

```
Android 10+ (API 29+) → copiarAMediaStore()
  └─ Inserta el PDF en MediaStore.Downloads con URI pública del sistema
  └─ Cualquier app puede leer esa URI sin permisos adicionales

Android 7–9 (API 24–28) → FileProvider
  └─ content://com.agroappreact.fileprovider/...
  └─ Permisos propagados con FLAG_GRANT_READ_URI_PERMISSION + ClipData
```

**Nombre del módulo nativo:** `AgroShareModule`

> React Native registra internamente un módulo llamado `"ShareModule"` para su API `Share`. Nombrar el módulo propio igual causa que `NativeModules.ShareModule` apunte al interno de RN (sin el método `sharePdf`). El nombre `AgroShareModule` evita la colisión.

---

## Implementación

### Arquitectura del módulo

```
ShareModule.java          ← ReactContextBaseJavaModule, getName() = "AgroShareModule"
ShareModulePackage.java   ← ReactPackage, registrado en MainApplication.kt
src/native/shareModule.ts ← Bridge TypeScript
android/.../res/xml/file_paths.xml  ← rutas FileProvider
```

### Lógica de `sharePdf(filePath, title, promise)` en Java

```java
// 1. Verificar que el archivo existe
File file = new File(filePath);
if (!file.exists()) { promise.reject("FILE_NOT_FOUND", "…"); return; }

// 2. Obtener Activity activa
Activity activity = getCurrentActivity();
if (activity == null) { promise.reject("NO_ACTIVITY", "…"); return; }

// 3. Obtener URI según versión de Android
Uri shareUri;
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
    shareUri = copiarAMediaStore(file);   // Android 10+
} else {
    shareUri = FileProvider.getUriForFile(         // Android 7–9
        context, "com.agroappreact.fileprovider", file);
}

// 4. Construir Intent
Intent intent = new Intent(Intent.ACTION_SEND);
intent.setType("application/pdf");
intent.putExtra(Intent.EXTRA_STREAM, shareUri);
intent.putExtra(Intent.EXTRA_SUBJECT, title);
intent.putExtra(Intent.EXTRA_TEXT, title);   // ← evita "mensaje vacío" en WhatsApp

// 5. ClipData para propagación de permisos en chooser (Android 10+)
intent.setClipData(ClipData.newRawUri(title, shareUri));
intent.addFlags(FLAG_GRANT_READ_URI_PERMISSION | FLAG_GRANT_WRITE_URI_PERMISSION);

// 6. Lanzar chooser
activity.startActivity(Intent.createChooser(intent, "Compartir PDF via..."));
promise.resolve(filePath);
```

### `copiarAMediaStore` (Android 10+)

```java
private Uri copiarAMediaStore(File file) throws Exception {
    ContentResolver resolver = getReactApplicationContext().getContentResolver();

    ContentValues values = new ContentValues();
    values.put(MediaStore.Downloads.DISPLAY_NAME,   file.getName());
    values.put(MediaStore.Downloads.MIME_TYPE,      "application/pdf");
    values.put(MediaStore.Downloads.RELATIVE_PATH,
        Environment.DIRECTORY_DOWNLOADS + "/AgroApp");
    values.put(MediaStore.Downloads.IS_PENDING, 1);  // bloquea hasta terminar copia

    Uri itemUri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
    if (itemUri == null) throw new Exception("No se pudo crear entrada en MediaStore");

    // Copiar bytes del archivo privado → URI pública
    try (OutputStream os = resolver.openOutputStream(itemUri);
         InputStream  is = new FileInputStream(file)) {
        byte[] buf = new byte[8192];
        int len;
        while ((len = is.read(buf)) > 0) os.write(buf, 0, len);
    }

    // Marcar como listo — a partir de aquí otras apps pueden leerlo
    values.clear();
    values.put(MediaStore.Downloads.IS_PENDING, 0);
    resolver.update(itemUri, values, null, null);

    return itemUri;
}
```

### `file_paths.xml` — rutas FileProvider

```xml
<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <cache-path         name="camera_cache"       path="." />
    <files-path         name="internal_files"     path="." />
    <external-files-path name="external_documents" path="Documents/" />
    <external-files-path name="agroreports"        path="Documents/AgroApp/" />
</paths>
```

El `<provider>` en `AndroidManifest.xml` ya estaba declarado con `authorities="${applicationId}.fileprovider"`.

### Bridge TypeScript

```typescript
// src/native/shareModule.ts
const { AgroShareModule } = NativeModules;  // nombre único

export const shareModule = {
  sharePdf(filePath: string, title: string): Promise<string> {
    if (!AgroShareModule || typeof AgroShareModule.sharePdf !== 'function') {
      return Promise.reject(
        new Error('AgroShareModule no disponible — verifica MainApplication.kt')
      );
    }
    return AgroShareModule.sharePdf(filePath, title);
  },
};
```

> **Patrón de validación en tiempo de llamada:** `NativeModules` puede devolver `{}` (truthy) en lugar de `null` para módulos no registrados — el operador `??` no lo detecta. La validación `typeof method !== 'function'` sí.

---

## Problemas encontrados y soluciones

| Problema | Causa | Solución |
|----------|-------|----------|
| `"El mensaje no contiene datos"` en WhatsApp | `file://` URI o FileProvider solo en Android 10+ | `copiarAMediaStore()` genera URI pública |
| `undefined is not a function` al llamar `sharePdf` | `NativeModules.ShareModule` apuntaba al módulo interno de RN | Renombrar módulo a `AgroShareModule` |
| Módulo no encontrado después de registrarlo | Gradle build incremental no recompiló el módulo nuevo | `./gradlew clean assembleRelease` |
| `"ShareModule no disponible"` tras clean build | Colisión de nombre con módulo interno de RN | Confirmado por renombrado a `AgroShareModule` |
| `ClipData` no propagaba permisos | Intent sin `setClipData` + `FLAG_GRANT_READ_URI_PERMISSION` solo | Añadir `setClipData()` antes de `startActivity` |

---

## Resultado

- Share Intent funcional en **WhatsApp**, **Gmail** y cualquier app del chooser.
- Sin `FileUriExposedException` en ninguna versión de Android (7–13 probado).
- El PDF copiado a MediaStore queda disponible en **Descargas/AgroApp/** del dispositivo.
- Sin permisos de almacenamiento adicionales requeridos al usuario.

---

## Consecuencias

**Positivas:**
- Compatibilidad garantizada Android 7–13+ con una sola implementación.
- El archivo copiado a MediaStore es un efecto secundario útil: el usuario tiene el PDF en Descargas sin pasos extra.
- No requiere `WRITE_EXTERNAL_STORAGE` (obsoleto en API 30+) ni `READ_EXTERNAL_STORAGE`.

**Negativas:**
- En Android 10+, se crea una copia del PDF en `Descargas/AgroApp/` además de la copia en almacenamiento privado de la app. Acumulación de copias si el usuario comparte el mismo PDF varias veces.
- `IS_PENDING = 1` introduce una pequeña latencia antes de que el archivo esté disponible para el chooser (mitigado por la copia en el mismo bloque).

---

*Relacionado con: [ADR-002 — Biblioteca PDF](ADR-002-biblioteca-pdf.md)*
