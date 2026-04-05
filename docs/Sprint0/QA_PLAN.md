# QA_PLAN.md — Plan de Pruebas QA/QC v1.0

> AgroApp · Sprint 0–4  
> Responsable: Cervantes Quiroz Ángel Gerardo (QA Lead)  
> ERS de referencia: IEEE 830-1998 v2.0

---

## 1. Alcance

### Incluido

- Pruebas unitarias de módulos Java (DAOs, Native Modules @ReactMethod)
- Pruebas de integración entre capas (React Native ↔ Bridge @ReactMethod ↔ Java/SQLite)
- Pruebas de regresión tras cada merge a `develop`
- Pruebas Offline-First en modo avión en dispositivo real
- Pruebas de usabilidad con productores ganaderos reales (Zitácuaro/Ocampo)
- Pruebas End-to-End del flujo completo en Sprint 4

### Excluido

- Pruebas de penetración / seguridad avanzada
- Pruebas de rendimiento bajo carga (app de usuario individual)
- Pruebas en iOS (fuera del alcance v1.0)
- Pruebas de conectividad de red — el sistema es estrictamente offline (ADR-001)

---

## 2. Estrategia por Sprint

| Tipo de prueba | Sprints | Responsable | Criterio de aceptación |
|---|---|---|---|
| Pruebas de Entorno (PE-ENV) | S0 | Todos | 4/4 equipos con entorno funcional |
| Pruebas de BD (PE-BD) | S0 | González P. | Tablas creadas, transacciones ACID |
| Pruebas de DAO (PE-DAO) | S1–S4 | Cervantes Q. | CRUD sin errores, constraints respetados |
| Pruebas de Notificaciones (PE-NOT) | S2 | Cervantes Q. | AlarmManager en modo avión |
| Pruebas Offline (PE-OFF) | S0–S4 | Cervantes Q. | App funcional con WiFi y datos desactivados |
| Pruebas de QC (PE-QC) | S0–S4 | Gómez M. | Checklist QC aprobado por sprint |
| Pruebas Unitarias | S1–S4 | Cervantes Q. | 100% RF del sprint ≥ 1 caso; 0 fallas críticas |
| Pruebas de Integración | S3–S4 | Cervantes Q. | Flujo entre módulos sin errores |
| Pruebas Offline-First | S2–S4 | Cervantes Q. | 100% RF funcionales en modo avión |
| Pruebas de Usabilidad | S4 | Todo el equipo | ≥ 3 productores ganaderos reales evalúan |
| Pruebas E2E | S4 | Cervantes Q. | Flujo completo RF001→RF013 sin errores |

---

## 3. Dispositivos de Prueba

| ID | Modelo | Android (API) | Propósito |
|---|---|---|---|
| REAL-01 | Huawei Nova 8 [ANG-LX2] | ≥ API 24 | Pruebas funcionales y Offline-First |
| EMU-01 | Pixel 6 (AVD) | API 34 | Desarrollo principal |
| EMU-02 | Pixel 7 (AVD) | API 36 | Compatibilidad máxima (targetSdk) |

---

## 4. Casos de Prueba — Sprint 0

### Categoría PE-ENV — Verificación de Entorno

| ID | Descripción | Resultado esperado |
|---|---|---|
| PE-ENV-001 | Node.js ≥ v22.11.0 instalado en los 4 equipos | `node --version` retorna ≥ v22.11.0 |
| PE-ENV-002 | Android Studio Koala 2024.1.1 instalado | AS abre sin errores |
| PE-ENV-003 | SDK API 24 y API 36 disponibles en SDK Manager | Ambas APIs listadas como instaladas |
| PE-ENV-004 | NDK 27.1.12297006 instalado | NDK visible en SDK Manager |
| PE-ENV-005 | Build Tools 36.0.0 instalados | Build Tools 36.0.0 listado |
| PE-ENV-006 | ANDROID_HOME configurado correctamente | `echo $ANDROID_HOME` retorna ruta válida |
| PE-ENV-007 | `npm run android` produce BUILD SUCCESSFUL | Sin errores de compilación |
| PE-ENV-008 | Metro Bundler arranca sin errores | "Metro waiting on port 8081" |

### Categoría PE-BD — Base de Datos

| ID | Descripción | Resultado esperado |
|---|---|---|
| PE-BD-001 | Las 6 tablas se crean al iniciar la app por primera vez | `agroapp.db` contiene las 6 tablas |
| PE-BD-002 | INSERT en `animales` con transacción ACID | Registro insertado, sin error |
| PE-BD-003 | Arete inválido (≠ 10 dígitos) es rechazado por el DAO | Excepción lanzada, BD sin cambios |
| PE-BD-004 | DELETE con CASCADE elimina fotos y eventos del animal | Registros hijos eliminados automáticamente |
| PE-BD-005 | Transacción abortada no corrompe la BD | BD en estado consistente tras fallo |
| PE-BD-006 | Los 5 índices de rendimiento existen en la BD | `PRAGMA index_list(tabla)` los confirma |

### Categoría PE-DAO — Data Access Objects

| ID | Descripción | Resultado esperado |
|---|---|---|
| PE-DAO-001 | `AnimalDAO.insertAnimal()` inserta y retorna ID | ID > 0 |
| PE-DAO-002 | `AnimalDAO.getAllAnimales()` retorna WritableArray | Lista no nula |
| PE-DAO-003 | `UsuarioDAO.crearPIN()` almacena hash (no plano) | PIN en BD ≠ PIN en texto |
| PE-DAO-004 | `UsuarioDAO.validarPIN()` retorna true con PIN correcto | Acceso otorgado |
| PE-DAO-005 | `UsuarioDAO.validarPIN()` retorna false con PIN incorrecto | Acceso denegado |
| PE-DAO-006 | `GastoDAO.insertGasto()` con arete nulo (gasto general) | Inserción exitosa con arete NULL |

### Categoría PE-NOT — Notificaciones

| ID | Descripción | Resultado esperado |
|---|---|---|
| PE-NOT-001 | `NotificationHelper` programa 3 alarmas por evento | 3 alarmas registradas en AlarmManager |
| PE-NOT-002 | Notificación se dispara en modo avión | Notificación visible sin conexión |
| PE-NOT-003 | Eliminar evento cancela sus alarmas | AlarmManager cancela por `alarma_id` |

### Categoría PE-OFF — Offline-First

| ID | Descripción | Resultado esperado |
|---|---|---|
| PE-OFF-001 | App abre correctamente en modo avión | Sin error de red, UI carga |
| PE-OFF-002 | INSERT en BD funciona en modo avión | Registro guardado localmente |
| PE-OFF-003 | UPDATE en BD funciona en modo avión | Cambio persistido |
| PE-OFF-004 | Notificaciones se disparan en modo avión | AlarmManager funciona sin red |
| PE-OFF-005 | Sin permiso INTERNET en `AndroidManifest.xml` | `grep INTERNET AndroidManifest.xml` → sin resultado |

### Categoría PE-QC — Control de Calidad

| ID | Descripción | Resultado esperado |
|---|---|---|
| PE-QC-001 | Estructura de carpetas coincide con ADR-001 | Anexo P checklist completo ≥ 90% OK |
| PE-QC-002 | Prototipos Figma cubren RF001–RF013 | Anexo L checklist ≥ 90% OK |
| PE-QC-003 | Texto de cuerpo nunca sobre fondo #98A287 | 0 violaciones en inspección visual |
| PE-QC-004 | Fuente Poppins usada consistentemente | Todos los prototipos usan Poppins |
| PE-QC-005 | Autenticación usa PIN numérico (no usuario/contraseña) | Pantalla MO-001 muestra campo numérico |
| PE-QC-006 | `package` en `AndroidManifest.xml` = `com.agroappreact` | `grep applicationId` confirma valor |

---

## 5. Métricas de Calidad

| Métrica | Objetivo | Cómo se mide |
|---|---|---|
| Cobertura de RF | 100% RF del sprint con ≥ 1 caso de prueba | Conteo de casos vs RF |
| Densidad de defectos | ≤ 2 bugs críticos por sprint | Issues etiquetados en GitHub |
| Tasa de resolución | ≥ 80% bugs resueltos antes del Sprint Review | Issues cerrados / total |
| Tiempo medio resolución | ≤ 48 horas para bugs críticos | Fecha apertura vs cierre |
| Cobertura offline | 100% RF funcionales en modo avión | Pruebas PE-OFF por sprint |

---

## 6. Ciclo de Vida de un Defecto

```
Detectado → Reportado (Issue GitHub) → Asignado → En progreso → Resuelto → Verificado → Cerrado
                                                                              │
                                                                    ← Reabierto si falla verificación
```

**Severidades:**
- 🔴 **Crítico** — bloquea funcionalidad principal o corrompe datos → resuelto en ≤ 24h
- 🟠 **Alto** — afecta RF pero tiene workaround → resuelto en ≤ 48h
- 🟡 **Medio** — problema menor de UI o comportamiento inesperado → resuelto en el sprint
- 🟢 **Bajo** — mejora o issue cosmético → backlog

---

## 7. CI Manual — Protocolo Sprint 0

```bash
# Paso 1: Clonar fresco desde develop
git clone https://github.com/LuisErnesto221104/AgroAppReact.git
cd AgroAppReact && git checkout develop && git pull origin develop

# Paso 2: Limpiar dependencias
rm -rf node_modules
npm install

# Paso 3: Limpiar Gradle
cd android && ./gradlew clean && cd ..

# Paso 4: Build limpio
npm run android
# Resultado esperado: BUILD SUCCESSFUL

# Paso 5: Instalar en dispositivo real (solo QA Lead)
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

> A partir de Sprint 2 se implementará CI automático con GitHub Actions.

---

*Última actualización: Sprint 0 — Abril 2026*
