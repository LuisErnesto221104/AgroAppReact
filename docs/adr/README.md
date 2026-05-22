# Architecture Decision Records — AgroApp

Registro de decisiones arquitectónicas del proyecto `com.agroappreact`.

> Un ADR documenta **qué** se decidió, **por qué** se descartaron las alternativas y **qué consecuencias** tiene la decisión. Se escribe una vez, no se modifica (solo se supera con un ADR nuevo).

---

## Índice

| ID | Título | Estado | Sprint |
|----|--------|--------|--------|
| [ADR-002](ADR-002-biblioteca-pdf.md) | Biblioteca PDF para generación offline | ✅ APROBADO | Sprint 4 — Anexo A |
| [ADR-003](ADR-003-share-intent.md) | Estrategia Share Intent para archivos PDF | ✅ APROBADO | Sprint 4 — Anexo D |

---

## Cómo leer un ADR

Cada ADR contiene:
1. **Contexto** — qué problema se estaba resolviendo y qué restricciones aplicaban.
2. **Opciones evaluadas** — tabla comparativa de alternativas.
3. **Decisión** — la opción elegida y por qué.
4. **Implementación** — código relevante y detalles técnicos.
5. **Resultado** — confirmación de que funciona en producción.
6. **Consecuencias** — trade-offs positivos y negativos.

## Cómo añadir un ADR nuevo

1. Crear `docs/adr/ADR-NNN-titulo-corto.md` con la plantilla.
2. Añadir una fila al índice de este README.
3. Hacer commit con mensaje `ADR-NNN: Titulo descriptivo`.
