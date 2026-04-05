# RIESGOS.md — Registro de Riesgos del Proyecto

> AgroApp · Consultora Los Primos · Sprint 0  
> Estándar de referencia: ISO/IEC/IEEE 16085:2021  
> Responsable: Gómez Martínez Luis Ernesto (Project Leader)

---

## Escala de Evaluación

| Valor | Probabilidad | Impacto |
|---|---|---|
| 3 — Alto (A) | Muy probable ocurra en el proyecto | Bloquea entrega o corrompe datos |
| 2 — Medio (M) | Puede ocurrir bajo ciertas condiciones | Retrasa un sprint o afecta RF |
| 1 — Bajo (B) | Poco probable | Impacto menor, workaround disponible |

**Nivel de Riesgo = Probabilidad × Impacto**  
`1–2 = Bajo · 3–4 = Medio · 6–9 = Alto`

---

## Registro de Riesgos

### R-01 — Curva de aprendizaje Bridge clásico (@ReactMethod)

| Campo | Valor |
|---|---|
| **ID** | R-01 |
| **Categoría** | Técnico |
| **Descripción** | El Bridge clásico (@ReactMethod + ReadableMap) requiere conocer el ciclo de vida de los Native Modules. El equipo puede necesitar tiempo adicional para dominar el patrón. |
| **Probabilidad** | Alto (3) |
| **Impacto** | Alto (3) |
| **Nivel** | 9 — Crítico |
| **Sprint afectado** | S1 |
| **Plan de mitigación** | Guía técnica documentada en `docs/BRIDGE.md`. Plantillas de código para cada Native Module. SCR-001 aprobado en Sprint 0. |
| **Responsable** | Gómez M. Luis Ernesto |
| **Estatus** | Activo — monitorear en S1 |

---

### R-02 — Inconsistencia de entorno entre los 4 equipos

| Campo | Valor |
|---|---|
| **ID** | R-02 |
| **Categoría** | Entorno |
| **Descripción** | Diferencias en versiones de Node, SDK, NDK o JDK entre los equipos pueden causar builds exitosos en un equipo pero fallidos en otro. |
| **Probabilidad** | Medio (2) |
| **Impacto** | Alto (3) |
| **Nivel** | 6 — Alto |
| **Sprint afectado** | S0–S4 |
| **Plan de mitigación** | `ENTORNO.md` documenta versiones exactas. CI manual verifica build en 4 equipos al cierre de cada sprint. `package-lock.json` comiteado para reproducibilidad de dependencias npm. |
| **Responsable** | González P. Brayan |
| **Estatus** | Mitigado parcialmente — verificación S0 en progreso |

---

### R-03 — Corrupción de datos SQLite por cierre forzado

| Campo | Valor |
|---|---|
| **ID** | R-03 |
| **Categoría** | Datos / Confiabilidad |
| **Descripción** | Si la app es cerrada forzosamente durante una escritura en SQLite sin transacción, los datos pueden quedar en estado inconsistente. Crítico en contexto ganadero (datos de salud animal). |
| **Probabilidad** | Bajo (1) |
| **Impacto** | Alto (3) |
| **Nivel** | 3 — Medio |
| **Sprint afectado** | S1–S4 |
| **Plan de mitigación** | RNF001 obliga transacciones ACID en todos los DAOs. Patrón `beginTransaction() / setTransactionSuccessful() / endTransaction()` en bloque `try/finally`. Ver `docs/DATABASE.md`. |
| **Responsable** | González P. Brayan |
| **Estatus** | Mitigado — patrón implementado en DatabaseHelper v4 |

---

### R-04 — Ausencia de integrante por causas académicas o personales

| Campo | Valor |
|---|---|
| **ID** | R-04 |
| **Categoría** | Recursos Humanos |
| **Descripción** | Un integrante puede ausentarse durante uno o más sprints por carga académica de otras materias, enfermedad u otras causas. El equipo es de solo 4 personas. |
| **Probabilidad** | Medio (2) |
| **Impacto** | Medio (2) |
| **Nivel** | 4 — Medio |
| **Sprint afectado** | S1–S4 |
| **Plan de mitigación** | Toda decisión técnica documentada en Markdown (ADR, BRIDGE, DATABASE). Código comentado en español. Ningún integrante es el único que conoce una capa. Reportes de avance semanales (Formato F1). |
| **Responsable** | Gómez M. Luis Ernesto |
| **Estatus** | Activo — monitorear |

---

### R-05 — Dispositivo físico de pruebas fuera de servicio

| Campo | Valor |
|---|---|
| **ID** | R-05 |
| **Categoría** | Infraestructura |
| **Descripción** | El dispositivo REAL-01 (Huawei Nova 8) es el único hardware físico para pruebas offline-first. Si falla, se depende solo de emuladores. |
| **Probabilidad** | Bajo (1) |
| **Impacto** | Medio (2) |
| **Nivel** | 2 — Bajo |
| **Sprint afectado** | S2–S4 |
| **Plan de mitigación** | EMU-01 (Pixel 6 / API 34) puede simular modo avión. EMU-02 (Pixel 7 / API 36) como respaldo adicional. Las pruebas PE-OFF-001 a PE-OFF-005 son replicables en emulador. |
| **Responsable** | Cervantes Q. Ángel G. |
| **Estatus** | Activo |

---

### R-06 — Falla de AlarmManager en versiones Android ≥ 12

| Campo | Valor |
|---|---|
| **ID** | R-06 |
| **Categoría** | Técnico / Compatibilidad |
| **Descripción** | Android 12+ (API 31+) requiere el permiso `SCHEDULE_EXACT_ALARM` para alarmas exactas. Sin él, AlarmManager usa alarmas inexactas y las notificaciones pueden llegar tarde. |
| **Probabilidad** | Alto (3) |
| **Impacto** | Medio (2) |
| **Nivel** | 6 — Alto |
| **Sprint afectado** | S2 |
| **Plan de mitigación** | Agregar `<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>` en `AndroidManifest.xml`. Verificar con `AlarmManager.canScheduleExactAlarms()` en runtime. Documentar en PE-NOT. |
| **Responsable** | González P. Brayan |
| **Estatus** | Identificado — acción en Sprint 2 |

---

### R-07 — Cambios de API en React Native 0.84.x durante el proyecto

| Campo | Valor |
|---|---|
| **ID** | R-07 |
| **Categoría** | Técnico |
| **Descripción** | React Native sigue un ciclo de releases frecuente. Un patch o minor release durante el proyecto puede introducir cambios que rompan la integración con los Native Modules del Bridge. |
| **Probabilidad** | Bajo (1) |
| **Impacto** | Medio (2) |
| **Nivel** | 2 — Bajo |
| **Sprint afectado** | S1–S4 |
| **Plan de mitigación** | Versión de React Native fijada en `package.json` (`"react-native": "0.84.1"`). `package-lock.json` comiteado. No actualizar dependencias sin revisión del equipo. |
| **Responsable** | Tapia R. Jovani |
| **Estatus** | Mitigado — versión fija |

---

### R-08 — Alcance demasiado amplio para 5 sprints

| Campo | Valor |
|---|---|
| **ID** | R-08 |
| **Categoría** | Gestión / Alcance |
| **Descripción** | AgroApp cubre 13 RF + 5 RNF + 4 RD. En equipos de 4 personas con carga académica simultánea, el alcance puede exceder la capacidad real de los sprints S1–S4. |
| **Probabilidad** | Medio (2) |
| **Impacto** | Alto (3) |
| **Nivel** | 6 — Alto |
| **Sprint afectado** | S1–S4 |
| **Plan de mitigación** | Priorización MoSCoW aplicada al backlog. RF001–RF006 y RF013 son Must Have. RF011 (PDF) y RF012 (Dashboard) son Should Have. Revisión de alcance en cada Sprint Planning. |
| **Responsable** | Gómez M. Luis Ernesto |
| **Estatus** | Activo — monitorear en cada sprint |

---

### R-09 — Falta de acceso a ganaderos reales para pruebas de usabilidad

| Campo | Valor |
|---|---|
| **ID** | R-09 |
| **Categoría** | Validación |
| **Descripción** | Las pruebas de usabilidad planificadas para Sprint 4 requieren acceso a productores ganaderos reales de Zitácuaro/Ocampo. Puede ser difícil coordinar su disponibilidad. |
| **Probabilidad** | Medio (2) |
| **Impacto** | Bajo (1) |
| **Nivel** | 2 — Bajo |
| **Sprint afectado** | S4 |
| **Plan de mitigación** | Contactar a productores conocidos del equipo desde Sprint 3. Definir guión de prueba breve (≤ 30 minutos). Alternativa: usar a familiares con actividad ganadera. |
| **Responsable** | Gómez M. Luis Ernesto |
| **Estatus** | Pendiente — acción en S3 |

---

## Resumen Ejecutivo

| Nivel | Riesgos | IDs |
|---|---|---|
| 🔴 Crítico (7–9) | 1 | R-01 |
| 🟠 Alto (5–6) | 3 | R-02, R-06, R-08 |
| 🟡 Medio (3–4) | 2 | R-03, R-04 |
| 🟢 Bajo (1–2) | 3 | R-05, R-07, R-09 |

---

*Última actualización: Sprint 0 — Abril 2026*
