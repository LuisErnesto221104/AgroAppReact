package com.agroappreact.bridge;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableArray;

import com.agroappreact.animales.AnimalDAO;
import com.agroappreact.dao.EventoSanitarioDAO;
import com.agroappreact.dao.HistorialClinicoDAO;
import com.agroappreact.dao.HistorialItem;
import com.agroappreact.dao.GastoDAO;
import com.agroappreact.database.DatabaseHelper;
import com.agroappreact.models.EventoSanitario;
import com.agroappreact.models.Gasto;
import com.agroappreact.services.SanitarioCicloNOM041;
import com.agroappreact.services.InversionCalculadora;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

public class AgroBridgeModule extends ReactContextBaseJavaModule {

    private static final List<String> TIPOS_VALIDOS = Arrays.asList(
        "VACUNA",
        "DESPARASITACION",
        "ENFERMEDAD",
        "CIRUGIA",
        "OTRO"
    );

    private final DatabaseHelper databaseHelper;
    private final EventoSanitarioDAO eventoSanitarioDAO;
    private final HistorialClinicoDAO historialClinicoDAO;
    private final GastoDAO gastoDAO;
    private final AnimalDAO animalDAO;

    public AgroBridgeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.databaseHelper = DatabaseHelper.getInstance(reactContext);
        this.eventoSanitarioDAO = new EventoSanitarioDAO(databaseHelper);
        this.historialClinicoDAO = new HistorialClinicoDAO(databaseHelper);
        this.gastoDAO = new GastoDAO(databaseHelper);
        this.animalDAO = new AnimalDAO(databaseHelper);
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

    @ReactMethod
    public void registrarEventoSanitario(ReadableMap datos, Promise promise) {
        try {
            int animalId = leerEntero(datos, "animalId");
            String tipoEvento = leerTexto(datos, "tipoEvento");
            String descripcion = leerTexto(datos, "descripcion");
            String veterinario = leerTexto(datos, "veterinario");
            String dosis = leerTexto(datos, "dosis");
            String observaciones = leerTexto(datos, "observaciones");
            String fechaEvento = leerTexto(datos, "fechaEvento");
            String fechaProximoEvento = leerTexto(datos, "fechaProximoEvento");

            validarAnimal(animalId);
            validarTipoEvento(tipoEvento);
            validarFechas(fechaEvento, fechaProximoEvento);

            EventoSanitario evento = new EventoSanitario();
            evento.setAnimalId(animalId);
            evento.setTipoEvento(tipoEvento);
            evento.setDescripcion(descripcion);
            evento.setFechaEvento(fechaEvento);
            evento.setVeterinario(veterinario);
            evento.setDosis(dosis);
            evento.setObservaciones(observaciones);
            evento.setFechaProximoEvento(fechaProximoEvento);

            long eventoId = eventoSanitarioDAO.insertarEvento(evento);
            if (eventoId <= 0) {
                promise.reject("ERR_EVENTO_SANITARIO_INSERT", "No se pudo registrar el evento sanitario.");
                return;
            }

            WritableMap resultado = Arguments.createMap();
            resultado.putBoolean("ok", true);
            resultado.putDouble("eventoId", (double) eventoId);
            promise.resolve(resultado);
        } catch (Exception e) {
            promise.reject("ERR_EVENTO_SANITARIO", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void obtenerEventosSanitarios(double animalIdDouble, Promise promise) {
        try {
            int animalId = (int) animalIdDouble;
            validarAnimal(animalId);

            List<EventoSanitario> eventos = eventoSanitarioDAO.obtenerEventosPorAnimal(animalId);
            WritableArray array = Arguments.createArray();

            for (EventoSanitario evento : eventos) {
                array.pushMap(serializarEvento(evento));
            }

            promise.resolve(array);
        } catch (Exception e) {
            promise.reject("ERR_EVENTOS_SANITARIOS", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void getEventosMes(int year, int month, Promise promise) {
        try {
            List<EventoSanitario> eventos = eventoSanitarioDAO.obtenerEventosPorMes(year, month);
            WritableArray array = Arguments.createArray();

            for (EventoSanitario evento : eventos) {
                array.pushMap(serializarEvento(evento));
            }

            promise.resolve(array);
        } catch (Exception e) {
            promise.reject("ERR_EVENTOS_MES", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void getHistorialClinico(double animalIdDouble, double paginaDouble, Promise promise) {
        try {
            int animalId = (int) animalIdDouble;
            int pagina = (int) paginaDouble;
            validarAnimal(animalId);
            final int porPagina = 10;
            List<HistorialItem> items = historialClinicoDAO.obtenerHistorialCompleto(animalId, pagina, porPagina);
            int total = historialClinicoDAO.contarEventos(animalId);

            WritableArray array = Arguments.createArray();
            for (HistorialItem h : items) {
                WritableMap map = Arguments.createMap();
                map.putInt("id", h.getId());
                map.putInt("animalId", h.getAnimalId());
                map.putString("arete", h.getArete());
                map.putString("tipoEvento", h.getTipoEvento());
                map.putString("descripcion", h.getDescripcion());
                map.putString("fechaEvento", h.getFechaEvento());
                map.putString("veterinario", h.getVeterinario());
                map.putString("dosis", h.getDosis());
                map.putString("observaciones", h.getObservaciones());
                array.pushMap(map);
            }

            WritableMap result = Arguments.createMap();
            result.putArray("items", array);
            result.putInt("total", total);
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("ERR_HISTORIAL_CLINICO", e.getMessage(), e);
        }
    }

    private WritableMap serializarEvento(EventoSanitario evento) {
        WritableMap map = Arguments.createMap();
        map.putInt("id", evento.getId());
        map.putInt("animalId", evento.getAnimalId());
        if (evento.getArete() != null) {
            map.putString("arete", evento.getArete());
        }
        map.putString("tipoEvento", evento.getTipoEvento());
        map.putString("descripcion", evento.getDescripcion());
        map.putString("fechaEvento", evento.getFechaEvento());
        map.putString("veterinario", evento.getVeterinario());
        map.putString("dosis", evento.getDosis());
        map.putString("observaciones", evento.getObservaciones());
        map.putString("fechaProximoEvento", evento.getFechaProximoEvento());
        return map;
    }

    private int leerEntero(ReadableMap datos, String clave) {
        if (datos == null || !datos.hasKey(clave) || datos.isNull(clave)) {
            throw new IllegalArgumentException("Falta el campo obligatorio: " + clave);
        }
        return datos.getInt(clave);
    }

    private String leerTexto(ReadableMap datos, String clave) {
        if (datos == null || !datos.hasKey(clave) || datos.isNull(clave)) {
            return null;
        }
        String valor = datos.getString(clave);
        return valor == null ? null : valor.trim();
    }

    private void validarAnimal(int animalId) {
        if (!eventoSanitarioDAO.animalExiste(animalId)) {
            throw new IllegalArgumentException("El animal_id no existe.");
        }
    }

    private void validarTipoEvento(String tipoEvento) {
        if (tipoEvento == null || !TIPOS_VALIDOS.contains(tipoEvento.trim())) {
            throw new IllegalArgumentException("tipoEvento debe ser uno de los valores permitidos.");
        }
    }

    private void validarFechas(String fechaEvento, String fechaProximoEvento) throws ParseException {
        Date fechaEventoDate = parseFecha(fechaEvento, "fechaEvento");
        Date fechaProximoDate = parseFecha(fechaProximoEvento, "fechaProximoEvento");

        Date hoy = truncarFecha(new Date());
        if (fechaEventoDate.after(hoy)) {
            throw new IllegalArgumentException("fecha_evento no puede ser futura.");
        }

        if (fechaProximoDate.before(fechaEventoDate)) {
            throw new IllegalArgumentException("fecha_proximo_evento debe ser mayor o igual a fecha_evento.");
        }
    }

    private Date parseFecha(String valor, String campo) throws ParseException {
        if (valor == null || valor.trim().isEmpty()) {
            throw new IllegalArgumentException("Falta el campo obligatorio: " + campo);
        }

        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
        format.setLenient(false);
        format.setTimeZone(TimeZone.getTimeZone("UTC"));
        return truncarFecha(format.parse(valor.trim()));
    }

    // ===== MÉTODOS DE GASTOS (Sprint 4) =====

    @ReactMethod
    public void registrarGasto(ReadableMap datos, Promise promise) {
        try {
            Integer animalId = datos.hasKey("animalId") && !datos.isNull("animalId") 
                ? datos.getInt("animalId") 
                : null;
            String categoria = datos.getString("categoria");
            String descripcion = datos.getString("descripcion");
            double monto = datos.getDouble("monto");
            String fecha = datos.getString("fecha");
            String notas = datos.hasKey("notas") && !datos.isNull("notas") ? datos.getString("notas") : null;

            if (categoria == null || descripcion == null || fecha == null) {
                promise.reject("ERROR", "Faltan campos obligatorios");
                return;
            }

            if (monto < 0) {
                promise.reject("ERROR", "El monto no puede ser negativo");
                return;
            }

            Gasto gasto = new Gasto(animalId, categoria, descripcion, monto, fecha, notas);
            long id = gastoDAO.insertarGasto(gasto);

            if (id > 0) {
                promise.resolve((double) id);
            } else {
                promise.reject("ERROR", "No se pudo insertar el gasto");
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getGastosPorAnimal(double animalIdDouble, Promise promise) {
        try {
            int animalId = (int) animalIdDouble;
            List<Gasto> gastos = gastoDAO.obtenerGastosPorAnimal(animalId);
            WritableArray array = Arguments.createArray();

            for (Gasto gasto : gastos) {
                WritableMap map = Arguments.createMap();
                map.putInt("id", gasto.getId());
                map.putInt("animalId", gasto.getAnimalId() != null ? gasto.getAnimalId() : -1);
                map.putString("categoria", gasto.getCategoria());
                map.putString("descripcion", gasto.getDescripcion());
                map.putDouble("monto", gasto.getMonto());
                map.putString("fecha", gasto.getFecha());
                map.putString("notas", gasto.getNotas());
                array.pushMap(map);
            }

            promise.resolve(array);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void obtenerTodosGastos(Promise promise) {
        try {
            List<Gasto> gastos = gastoDAO.obtenerTodosGastos();
            WritableArray array = Arguments.createArray();

            for (Gasto gasto : gastos) {
                WritableMap map = Arguments.createMap();
                map.putInt("id", gasto.getId());
                if (gasto.getAnimalId() != null) {
                    map.putInt("animalId", gasto.getAnimalId());
                } else {
                    map.putNull("animalId");
                }
                map.putString("categoria", gasto.getCategoria());
                map.putString("descripcion", gasto.getDescripcion());
                map.putDouble("monto", gasto.getMonto());
                map.putString("fecha", gasto.getFecha());
                map.putString("notas", gasto.getNotas());
                array.pushMap(map);
            }

            promise.resolve(array);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void updateGasto(ReadableMap datos, Promise promise) {
        try {
            int id = datos.getInt("id");
            Integer animalId = datos.hasKey("animalId") && !datos.isNull("animalId") 
                ? datos.getInt("animalId") 
                : null;
            String categoria = datos.getString("categoria");
            String descripcion = datos.getString("descripcion");
            double monto = datos.getDouble("monto");
            String fecha = datos.getString("fecha");
            String notas = datos.hasKey("notas") && !datos.isNull("notas") ? datos.getString("notas") : null;

            if (monto < 0) {
                promise.reject("ERROR", "El monto no puede ser negativo");
                return;
            }

            Gasto gasto = new Gasto(id, animalId, categoria, descripcion, monto, fecha, notas);
            int filas = gastoDAO.actualizarGasto(gasto);

            if (filas > 0) {
                promise.resolve(true);
            } else {
                promise.reject("ERROR", "No se encontró el gasto para actualizar");
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void deleteGasto(double idDouble, Promise promise) {
        try {
            int id = (int) idDouble;
            boolean eliminado = gastoDAO.eliminarGasto(id);
            promise.resolve(eliminado);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void sumarGastosPorAnimal(double animalIdDouble, Promise promise) {
        try {
            int animalId = (int) animalIdDouble;
            double total = gastoDAO.sumarGastosPorAnimal(animalId);
            promise.resolve(total);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    private Date truncarFecha(Date fecha) {
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
        format.setTimeZone(TimeZone.getTimeZone("UTC"));
        try {
            return format.parse(format.format(fecha));
        } catch (ParseException e) {
            return fecha;
        }
    }

    @ReactMethod
    public void eliminarEventoSanitario(double idDouble, Promise promise) {
        try {
            int id = (int) idDouble;
            if (id <= 0) {
                promise.reject("ERR_ELIMINAR_EVENTO", "ID de evento inválido.");
                return;
            }
            boolean eliminado = eventoSanitarioDAO.eliminarEvento(id);
            promise.resolve(eliminado);
        } catch (Exception e) {
            promise.reject("ERR_ELIMINAR_EVENTO", e.getMessage());
        }
    }

    @ReactMethod
    public void calcularProximaFechaNOM(String tipoEvento, String subtipo, String fechaEvento, Promise promise) {
        try {
            String proximaFecha = SanitarioCicloNOM041.calcularProximaFecha(tipoEvento, subtipo, fechaEvento);
            if (proximaFecha != null) {
                promise.resolve(proximaFecha);
            } else {
                promise.reject("INVALID_CYCLE", "Ciclo NOM-041 desconocido para: " + tipoEvento + "/" + subtipo);
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    // Sprint 3 — RF002: Obtener margen real del animal vendido
    @ReactMethod
    public void getMargenRealAnimal(double animalId, Promise promise) {
        try {
            android.database.sqlite.SQLiteDatabase db = databaseHelper.getReadableDatabase();
            WritableMap result = InversionCalculadora.getMargenRealAnimal(db, (long) animalId);
            promise.resolve(result);
        } catch (Exception e) {
            WritableMap error = Arguments.createMap();
            error.putString("error", e.getMessage());
            promise.resolve(error);
        }
    }

    // Sprint 4 — RF003: Resumen completo de inversión por animal + breakdown categorías
    @ReactMethod
    public void getResumenInversionAnimal(double animalIdDouble, Promise promise) {
        try {
            int animalId = (int) animalIdDouble;
            android.database.sqlite.SQLiteDatabase db = databaseHelper.getReadableDatabase();

            WritableMap margen = InversionCalculadora.getMargenRealAnimal(db, animalId);
            GastoDAO.GastoResumen resumen = gastoDAO.getResumenPorAnimal(animalId);

            // Serializar porCategoria como WritableMap
            WritableMap porCategoriaMap = Arguments.createMap();
            for (java.util.Map.Entry<String, Double> entry : resumen.porCategoria.entrySet()) {
                porCategoriaMap.putDouble(entry.getKey(), entry.getValue());
            }

            margen.putMap("porCategoria", porCategoriaMap);
            margen.putInt("cantidadRegistros", resumen.cantidadRegistros);
            margen.putInt("animalId", animalId);

            promise.resolve(margen);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    // Sprint 4 — RF003: Resumen global del hato
    @ReactMethod
    public void getResumenHato(Promise promise) {
        try {
            GastoDAO.GastoResumen resumen = gastoDAO.getResumenHato();

            WritableMap porCategoriaMap = Arguments.createMap();
            for (java.util.Map.Entry<String, Double> entry : resumen.porCategoria.entrySet()) {
                porCategoriaMap.putDouble(entry.getKey(), entry.getValue());
            }

            WritableMap result = Arguments.createMap();
            result.putDouble("totalGeneral", resumen.totalGeneral);
            result.putInt("cantidadRegistros", resumen.cantidadRegistros);
            result.putMap("porCategoria", porCategoriaMap);
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    // Exponer lista de animales para selección en gastos
    @ReactMethod
    public void obtenerAnimales(Promise promise) {
        try {
            java.util.List<AnimalDAO.AnimalRecord> animals = animalDAO.listAnimals();
            WritableArray array = Arguments.createArray();
            for (AnimalDAO.AnimalRecord a : animals) {
                WritableMap map = Arguments.createMap();
                map.putDouble("id", a.id);
                map.putString("arete", a.arete);
                map.putString("especie", a.especie != null ? a.especie : "");
                map.putString("estado", a.estado != null ? a.estado : "ACTIVO");
                array.pushMap(map);
            }
            promise.resolve(array);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
}