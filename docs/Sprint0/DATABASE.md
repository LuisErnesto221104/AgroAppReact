# DATABASE.md — Esquema SQLite · Diagrama ER · DAOs · ACID

> AgroApp · DatabaseHelper.java v4 · Sprint 0  
> Responsable: González Posadas Brayan (Backend Developer)

---

## Información General

| Campo | Valor |
|---|---|
| Archivo de BD | `agroapp.db` |
| Motor | SQLite 3.x (`android.database.sqlite.SQLiteOpenHelper`) |
| Número de tablas | 6 |
| Número de DAOs | 6 |
| Ubicación en dispositivo | `/data/data/com.agroappreact/databases/agroapp.db` |
| Acceso externo | Solo la app (directorio privado de Android) |
| Patrón de acceso | Singleton (`DatabaseHelper`) |

---

## 1. Diagrama Entidad-Relación

```
┌──────────────┐       ┌──────────────────────┐
│   usuarios   │       │       animales        │
│──────────────│       │──────────────────────│
│ id (PK)      │       │ arete (PK, 10 dígitos)│
│ pin_hash     │       │ nombre               │
│ rol          │       │ raza                 │
│ creado_en    │       │ sexo (M/H)           │
└──────────────┘       │ fecha_nacimiento     │
                       │ peso_inicial         │
                       │ estado               │
                       │ creado_en            │
                       └──────────┬───────────┘
                                  │ 1
              ┌───────────────────┼──────────────────────┐
              │ N                 │ N                    │ N
  ┌───────────▼──────┐  ┌────────▼────────┐  ┌─────────▼────────┐
  │ eventos_sanitarios│  │historial_clinico│  │      gastos      │
  │──────────────────│  │─────────────────│  │──────────────────│
  │ id (PK)          │  │ id (PK)         │  │ id (PK)          │
  │ arete_animal (FK)│  │ arete_animal(FK)│  │ arete_animal(FK) │
  │ tipo_evento      │  │ fecha_inicio    │  │ concepto         │
  │ fecha_evento     │  │ sintomas        │  │ monto            │
  │ descripcion      │  │ diagnostico     │  │ tipo_gasto       │
  │ alarma_id        │  │ tratamiento     │  │ es_inversion     │
  │ completado       │  │ evolucion       │  │ fecha_gasto      │
  └──────────────────┘  │ fecha_fin       │  └──────────────────┘
                        └─────────────────┘
              │ N
  ┌───────────▼──────────┐
  │    fotos_animales    │
  │──────────────────────│
  │ id (PK)              │
  │ arete_animal (FK)    │
  │ ruta_local           │
  │ fecha_foto           │
  └──────────────────────┘
```

---

## 2. DDL — Definición de Tablas

### 2.1 Tabla `usuarios`

```sql
CREATE TABLE IF NOT EXISTS usuarios (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    pin_hash    TEXT    NOT NULL,
    rol         TEXT    NOT NULL DEFAULT 'USUARIO'
                        CHECK (rol IN ('ADMIN', 'USUARIO')),
    creado_en   INTEGER NOT NULL  -- Unix timestamp (ms)
);
```

### 2.2 Tabla `animales`

```sql
CREATE TABLE IF NOT EXISTS animales (
    arete            TEXT    PRIMARY KEY,        -- 10 dígitos SINIIGA (RD001)
    nombre           TEXT,
    raza             TEXT    NOT NULL,
    sexo             TEXT    NOT NULL CHECK (sexo IN ('M', 'H')),
    fecha_nacimiento INTEGER NOT NULL,            -- Unix timestamp
    peso_inicial     REAL,
    estado           TEXT    NOT NULL DEFAULT 'activo'
                             CHECK (estado IN ('activo', 'vendido', 'muerto')),
    creado_en        INTEGER NOT NULL
);
```

### 2.3 Tabla `fotos_animales`

```sql
CREATE TABLE IF NOT EXISTS fotos_animales (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    arete_animal TEXT    NOT NULL REFERENCES animales(arete) ON DELETE CASCADE,
    ruta_local   TEXT    NOT NULL,
    fecha_foto   INTEGER NOT NULL
);
```

### 2.4 Tabla `eventos_sanitarios`

```sql
CREATE TABLE IF NOT EXISTS eventos_sanitarios (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    arete_animal TEXT    NOT NULL REFERENCES animales(arete) ON DELETE CASCADE,
    tipo_evento  TEXT    NOT NULL CHECK (tipo_evento IN ('vacuna', 'desparasitacion', 'vitamina', 'otro')),
    fecha_evento INTEGER NOT NULL,
    descripcion  TEXT,
    alarma_id    INTEGER,           -- ID de AlarmManager para cancelar si se borra
    completado   INTEGER NOT NULL DEFAULT 0  -- 0 = pendiente, 1 = realizado
);
```

### 2.5 Tabla `historial_clinico`

```sql
CREATE TABLE IF NOT EXISTS historial_clinico (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    arete_animal TEXT    NOT NULL REFERENCES animales(arete) ON DELETE CASCADE,
    fecha_inicio INTEGER NOT NULL,
    sintomas     TEXT    NOT NULL,
    diagnostico  TEXT,
    tratamiento  TEXT,
    evolucion    TEXT,
    fecha_fin    INTEGER
);
```

### 2.6 Tabla `gastos`

```sql
CREATE TABLE IF NOT EXISTS gastos (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    arete_animal TEXT    REFERENCES animales(arete) ON DELETE SET NULL, -- nullable: gasto general
    concepto     TEXT    NOT NULL,
    monto        REAL    NOT NULL CHECK (monto >= 0),
    tipo_gasto   TEXT    NOT NULL CHECK (tipo_gasto IN ('alimentacion', 'medicamento', 'servicio', 'otro')),
    es_inversion INTEGER NOT NULL DEFAULT 0,  -- 0 = gasto, 1 = inversión
    fecha_gasto  INTEGER NOT NULL
);
```

---

## 3. Índices de Rendimiento

```sql
-- Filtro de inventario por estado (pantalla principal)
CREATE INDEX IF NOT EXISTS idx_animales_estado
    ON animales(estado);

-- Calendario sanitario RF008 — búsqueda por fecha
CREATE INDEX IF NOT EXISTS idx_eventos_fecha
    ON eventos_sanitarios(fecha_evento, arete_animal);

-- Bitácora clínica RF010 — por animal y fecha
CREATE INDEX IF NOT EXISTS idx_historial_animal
    ON historial_clinico(arete_animal, fecha_inicio);

-- Cálculo de inversión RF012 — por animal
CREATE INDEX IF NOT EXISTS idx_gastos_animal
    ON gastos(arete_animal, es_inversion);

-- Dashboard de costos RF006/RF012 — por fecha
CREATE INDEX IF NOT EXISTS idx_gastos_fecha
    ON gastos(fecha_gasto);
```

---

## 4. Transacciones ACID — Patrón de los DAOs

**RNF001:** El sistema debe usar transacciones ACID y escrituras síncronas para evitar pérdida de datos ante cierres forzados o agotamiento de batería.

```java
// Patrón obligatorio en todos los DAOs para INSERT/UPDATE/DELETE
public long insertAnimal(ReadableMap data) {
    SQLiteDatabase db = this.getWritableDatabase();
    db.beginTransaction();
    try {
        ContentValues values = new ContentValues();
        values.put("arete",            data.getString("arete"));
        values.put("raza",             data.getString("raza"));
        values.put("sexo",             data.getString("sexo"));
        values.put("fecha_nacimiento", data.getDouble("fechaNacimiento"));
        values.put("estado",           "activo");
        values.put("creado_en",        System.currentTimeMillis());

        long id = db.insertOrThrow("animales", null, values);
        db.setTransactionSuccessful();  // Solo si NO hubo excepción
        return id;
    } finally {
        db.endTransaction();  // Commit si setTransactionSuccessful(), Rollback si no
    }
}
```

> **`db.endTransaction()`** en el bloque `finally` garantiza que la BD nunca queda en estado inconsistente, incluso si la app es terminada forzosamente.

---

## 5. DAOs — Catálogo

| DAO | Tabla | Native Module | Responsable |
|---|---|---|---|
| `AnimalDAO` | `animales` | `AnimalModule` | González P. Brayan |
| `EventoSanitarioDAO` | `eventos_sanitarios` | `EventoSanitarioModule` | González P. Brayan |
| `GastoDAO` | `gastos` | `GastoModule` | González P. Brayan |
| `HistorialClinicoDAO` | `historial_clinico` | `HistorialClinicoModule` | González P. Brayan |
| `AlimentacionDAO` | `gastos` (tipo=alimentacion) | `AlimentacionModule` | González P. Brayan |
| `UsuarioDAO` | `usuarios` | `UsuarioModule` | González P. Brayan |

---

## 6. Validaciones de Dominio (RD001–RD004)

| Regla | Implementación |
|---|---|
| **RD001** — Arete SINIIGA: 10 dígitos exactos | `CHECK` en SQLite + validación en DAO antes de insert |
| **RD002** — Sexo: solo `'M'` o `'H'` | `CHECK (sexo IN ('M', 'H'))` en DDL |
| **RD003** — Monto gasto ≥ 0 | `CHECK (monto >= 0)` en DDL |
| **RD004** — PIN: 4–6 dígitos numéricos | Validación en `UsuarioDAO` antes de guardar hash |

---

## 7. DatabaseHelper — Singleton

```java
// android/app/src/main/java/com/agroappreact/DatabaseHelper.java
public class DatabaseHelper extends SQLiteOpenHelper {

    private static final String DB_NAME    = "agroapp.db";
    private static final int    DB_VERSION = 4;
    private static DatabaseHelper instance;

    // Patrón Singleton — una sola instancia por proceso
    public static synchronized DatabaseHelper getInstance(Context context) {
        if (instance == null) {
            instance = new DatabaseHelper(context.getApplicationContext());
        }
        return instance;
    }

    private DatabaseHelper(Context context) {
        super(context, DB_NAME, null, DB_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        // Crear las 6 tablas + índices
        db.execSQL(CREATE_TABLE_USUARIOS);
        db.execSQL(CREATE_TABLE_ANIMALES);
        db.execSQL(CREATE_TABLE_FOTOS);
        db.execSQL(CREATE_TABLE_EVENTOS);
        db.execSQL(CREATE_TABLE_HISTORIAL);
        db.execSQL(CREATE_TABLE_GASTOS);
        // Índices
        db.execSQL(CREATE_INDEX_ANIMALES_ESTADO);
        db.execSQL(CREATE_INDEX_EVENTOS_FECHA);
        db.execSQL(CREATE_INDEX_HISTORIAL_ANIMAL);
        db.execSQL(CREATE_INDEX_GASTOS_ANIMAL);
        db.execSQL(CREATE_INDEX_GASTOS_FECHA);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        // Migraciones incrementales por versión
    }
}
```

---

*Última actualización: Sprint 0 — Abril 2026*
