package com.agroappreact.pdf;

import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.os.Environment;

import com.agroappreact.database.DatabaseHelper;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.property.TextAlignment;
import com.itextpdf.layout.property.UnitValue;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class PdfModule extends ReactContextBaseJavaModule {

    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    public PdfModule(ReactApplicationContext ctx) {
        super(ctx);
    }

    @Override
    public String getName() {
        return "PdfModule";
    }

    @ReactMethod
    public void generateHatoPdf(Promise promise) {
        executor.execute(() -> {
            try {
                ReactApplicationContext context = getReactApplicationContext();

                // 1. Directorio: externalFilesDir/Documents/AgroApp/
                File docsDir = context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS);
                if (docsDir == null) {
                    docsDir = context.getFilesDir();
                }
                File agroDir = new File(docsDir, "AgroApp");
                if (!agroDir.exists() && !agroDir.mkdirs()) {
                    promise.reject("PDF_ERROR", "No se pudo crear el directorio de destino.");
                    return;
                }

                // 2. Nombre: hato_yyyyMMdd.pdf
                String fechaNombre = new SimpleDateFormat("yyyyMMdd", Locale.US).format(new Date());
                File pdfFile = new File(agroDir, "hato_" + fechaNombre + ".pdf");

                // 3. Consulta: animales activos
                SQLiteDatabase db = DatabaseHelper.getInstance(context).getReadableDatabase();
                Cursor cursor = db.rawQuery(
                    "SELECT id, numero_arete, especie, sexo, estado, peso_actual " +
                    "FROM animales WHERE estado = 'ACTIVO' ORDER BY numero_arete ASC",
                    null
                );

                // 4. Crear documento iText7
                PdfWriter writer = new PdfWriter(pdfFile.getAbsolutePath());
                PdfDocument pdfDoc = new PdfDocument(writer);
                Document document = new Document(pdfDoc, PageSize.A4);
                document.setMargins(36, 36, 36, 36);

                // Paleta de colores
                DeviceRgb headerGreen = new DeviceRgb(7,   97,  45);   // #07612d
                DeviceRgb white       = new DeviceRgb(255, 255, 255);
                DeviceRgb rowAlt      = new DeviceRgb(244, 248, 240);   // #f4f8f0
                DeviceRgb grayText    = new DeviceRgb(100, 100, 100);
                DeviceRgb footerGray  = new DeviceRgb(150, 150, 150);

                String ahora = new SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.US).format(new Date());

                // Título principal
                document.add(new Paragraph("AgroApp — Inventario del Hato")
                    .setFontSize(18)
                    .setBold()
                    .setFontColor(headerGreen)
                    .setTextAlignment(TextAlignment.CENTER));

                // Subtítulo con timestamp
                document.add(new Paragraph("Generado: " + ahora)
                    .setFontSize(10)
                    .setFontColor(grayText)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20));

                if (cursor == null || cursor.getCount() == 0) {
                    // Sin datos
                    document.add(new Paragraph("Sin animales activos registrados.")
                        .setFontSize(12)
                        .setFontColor(grayText)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setMarginTop(40));
                    if (cursor != null) cursor.close();
                } else {
                    // 5. Tabla — 6 columnas con pesos relativos
                    float[] colWidths = {2f, 2f, 1.2f, 1.5f, 1.5f, 2f};
                    Table table = new Table(UnitValue.createPercentArray(colWidths));
                    table.setWidth(UnitValue.createPercentValue(100));

                    // Fila de encabezados
                    String[] headers = {"Arete", "Especie", "Sexo", "Estado", "Peso kg", "Inversión MXN"};
                    for (String h : headers) {
                        table.addHeaderCell(
                            new Cell()
                                .add(new Paragraph(h).setBold().setFontColor(white).setFontSize(10))
                                .setBackgroundColor(headerGreen)
                                .setTextAlignment(TextAlignment.CENTER)
                                .setPadding(7)
                        );
                    }

                    // Índices de columnas (obtenidos una sola vez)
                    int idxId     = cursor.getColumnIndexOrThrow("id");
                    int idxArete  = cursor.getColumnIndexOrThrow("numero_arete");
                    int idxEspecie= cursor.getColumnIndexOrThrow("especie");
                    int idxSexo   = cursor.getColumnIndexOrThrow("sexo");
                    int idxEstado = cursor.getColumnIndexOrThrow("estado");
                    int idxPeso   = cursor.getColumnIndexOrThrow("peso_actual");

                    int rowNum = 0;
                    while (cursor.moveToNext()) {
                        int    animalId  = cursor.getInt(idxId);
                        String arete     = safe(cursor.getString(idxArete));
                        String especie   = safe(cursor.getString(idxEspecie));
                        String sexo      = safe(cursor.getString(idxSexo));
                        String estado    = safe(cursor.getString(idxEstado));
                        double peso      = cursor.isNull(idxPeso) ? 0.0 : cursor.getDouble(idxPeso);

                        // 6. Inversión acumulada por animal
                        double inversion = 0.0;
                        Cursor gc = db.rawQuery(
                            "SELECT SUM(monto) FROM gastos WHERE animal_id = ?",
                            new String[]{String.valueOf(animalId)}
                        );
                        if (gc != null) {
                            try {
                                if (gc.moveToFirst() && !gc.isNull(0)) {
                                    inversion = gc.getDouble(0);
                                }
                            } finally {
                                gc.close();
                            }
                        }

                        // Fila con color alterno
                        DeviceRgb rowBg = (rowNum % 2 == 0) ? white : rowAlt;

                        String[] values = {
                            arete,
                            especie,
                            sexo,
                            estado,
                            String.format(Locale.US, "%.1f", peso),
                            String.format(Locale.US, "$%.2f", inversion)
                        };
                        TextAlignment[] aligns = {
                            TextAlignment.LEFT,
                            TextAlignment.LEFT,
                            TextAlignment.CENTER,
                            TextAlignment.CENTER,
                            TextAlignment.RIGHT,
                            TextAlignment.RIGHT
                        };

                        for (int c = 0; c < values.length; c++) {
                            table.addCell(
                                new Cell()
                                    .add(new Paragraph(values[c]).setFontSize(9))
                                    .setBackgroundColor(rowBg)
                                    .setTextAlignment(aligns[c])
                                    .setPadding(5)
                            );
                        }
                        rowNum++;
                    }
                    cursor.close();
                    document.add(table);
                }

                // Footer
                document.add(new Paragraph(
                    "\nAgroApp v1.0 — Offline-First — com.agroappreact")
                    .setFontSize(8)
                    .setFontColor(footerGray)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(28));

                document.close();

                // 7. Devolver ruta absoluta a JS
                promise.resolve(pdfFile.getAbsolutePath());

            } catch (Exception e) {
                promise.reject("PDF_ERROR", e.getMessage(), e);
            }
        });
    }

    @ReactMethod
    public void generateAnimalPdf(double animalIdDouble, Promise promise) {
        executor.execute(() -> {
            try {
                int animalId = (int) animalIdDouble;
                ReactApplicationContext context = getReactApplicationContext();
                SQLiteDatabase db = DatabaseHelper.getInstance(context).getReadableDatabase();

                // 1. SELECT * FROM animales WHERE id = animalId
                Cursor cAnimal = db.rawQuery(
                    "SELECT numero_arete, especie, sexo, raza, estado, peso_actual, fecha_ingreso " +
                    "FROM animales WHERE id = ?",
                    new String[]{String.valueOf(animalId)}
                );
                if (cAnimal == null || !cAnimal.moveToFirst()) {
                    if (cAnimal != null) cAnimal.close();
                    promise.reject("PDF_ERROR", "Animal no encontrado con id: " + animalId);
                    return;
                }

                String arete        = safe(cAnimal.getString(cAnimal.getColumnIndexOrThrow("numero_arete")));
                String especie      = safe(cAnimal.getString(cAnimal.getColumnIndexOrThrow("especie")));
                String sexo         = safe(cAnimal.getString(cAnimal.getColumnIndexOrThrow("sexo")));
                String raza         = safe(cAnimal.getString(cAnimal.getColumnIndexOrThrow("raza")));
                String estado       = safe(cAnimal.getString(cAnimal.getColumnIndexOrThrow("estado")));
                int    idxPeso      = cAnimal.getColumnIndexOrThrow("peso_actual");
                double pesoActual   = cAnimal.isNull(idxPeso) ? 0.0 : cAnimal.getDouble(idxPeso);
                String fechaIngreso = safe(cAnimal.getString(cAnimal.getColumnIndexOrThrow("fecha_ingreso")));
                cAnimal.close();

                // 2. SELECT … FROM eventos_sanitarios WHERE animal_id=? ORDER BY fecha_evento DESC
                Cursor cEventos = db.rawQuery(
                    "SELECT tipo_evento, descripcion, fecha_evento, veterinario, observaciones " +
                    "FROM eventos_sanitarios WHERE animal_id = ? ORDER BY fecha_evento DESC",
                    new String[]{String.valueOf(animalId)}
                );

                // 3. SELECT … FROM gastos WHERE animal_id=? ORDER BY fecha DESC  +  SUM(monto)
                Cursor cGastos = db.rawQuery(
                    "SELECT categoria, descripcion, monto, fecha " +
                    "FROM gastos WHERE animal_id = ? ORDER BY fecha DESC",
                    new String[]{String.valueOf(animalId)}
                );
                double totalGastos = 0.0;
                Cursor cTotal = db.rawQuery(
                    "SELECT SUM(monto) FROM gastos WHERE animal_id = ?",
                    new String[]{String.valueOf(animalId)}
                );
                if (cTotal != null) {
                    try {
                        if (cTotal.moveToFirst() && !cTotal.isNull(0)) {
                            totalGastos = cTotal.getDouble(0);
                        }
                    } finally {
                        cTotal.close();
                    }
                }

                // Directorio y nombre de archivo
                File docsDir = context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS);
                if (docsDir == null) docsDir = context.getFilesDir();
                File agroDir = new File(docsDir, "AgroApp");
                if (!agroDir.exists() && !agroDir.mkdirs()) {
                    promise.reject("PDF_ERROR", "No se pudo crear el directorio de destino.");
                    return;
                }
                String fechaNombre  = new SimpleDateFormat("yyyyMMdd", Locale.US).format(new Date());
                String areteSafe    = arete.replaceAll("[^a-zA-Z0-9]", "_");
                File pdfFile        = new File(agroDir, "animal_" + areteSafe + "_" + fechaNombre + ".pdf");

                // 4. Documento iText7
                PdfWriter   writer  = new PdfWriter(pdfFile.getAbsolutePath());
                PdfDocument pdfDoc  = new PdfDocument(writer);
                Document    document = new Document(pdfDoc, PageSize.A4);
                document.setMargins(36, 36, 36, 36);

                DeviceRgb green      = new DeviceRgb(7,   97,  45);   // #07612d
                DeviceRgb white      = new DeviceRgb(255, 255, 255);
                DeviceRgb rowAlt     = new DeviceRgb(244, 248, 240);   // #f4f8f0
                DeviceRgb grayText   = new DeviceRgb(100, 100, 100);
                DeviceRgb footerGray = new DeviceRgb(150, 150, 150);
                DeviceRgb totalBg    = new DeviceRgb(232, 245, 236);   // #e8f5ec

                String ahora = new SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.US).format(new Date());

                document.add(new Paragraph("AgroApp — Ficha del Animal")
                    .setFontSize(18).setBold().setFontColor(green).setTextAlignment(TextAlignment.CENTER));
                document.add(new Paragraph("Arete: " + arete + "  |  Generado: " + ahora)
                    .setFontSize(10).setFontColor(grayText)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(20));

                // ── SECCIÓN 1: Datos del Animal ───────────────────────────
                addSectionTitle(document, "Datos del Animal", green, white);

                Table dataTable = new Table(UnitValue.createPercentArray(new float[]{3f, 5f}))
                    .setWidth(UnitValue.createPercentValue(100));
                String[][] campos = {
                    {"Arete",          arete},
                    {"Especie",        especie},
                    {"Sexo",           sexo},
                    {"Raza",           raza},
                    {"Estado",         estado},
                    {"Peso actual",    String.format(Locale.US, "%.2f kg", pesoActual)},
                    {"Fecha de ingreso", fechaIngreso},
                };
                for (int i = 0; i < campos.length; i++) {
                    DeviceRgb bg = (i % 2 == 0) ? white : rowAlt;
                    dataTable.addCell(new Cell()
                        .add(new Paragraph(campos[i][0]).setBold().setFontSize(10))
                        .setBackgroundColor(bg).setPadding(6));
                    dataTable.addCell(new Cell()
                        .add(new Paragraph(campos[i][1]).setFontSize(10))
                        .setBackgroundColor(bg).setPadding(6));
                }
                document.add(dataTable);
                document.add(new Paragraph(" "));

                // ── SECCIÓN 2: Historial Clínico ──────────────────────────
                addSectionTitle(document, "Historial Clinico", green, white);

                if (cEventos == null || cEventos.getCount() == 0) {
                    document.add(new Paragraph("Sin eventos clinicos registrados.")
                        .setFontSize(10).setFontColor(grayText).setMarginTop(6).setMarginBottom(12));
                } else {
                    float[] evCols = {2f, 2f, 4f, 2.5f, 3.5f};
                    Table evTable = new Table(UnitValue.createPercentArray(evCols))
                        .setWidth(UnitValue.createPercentValue(100));
                    for (String h : new String[]{"Fecha", "Tipo", "Descripcion", "Veterinario", "Observaciones"}) {
                        evTable.addHeaderCell(new Cell()
                            .add(new Paragraph(h).setBold().setFontColor(white).setFontSize(9))
                            .setBackgroundColor(green).setTextAlignment(TextAlignment.CENTER).setPadding(5));
                    }
                    int rowNum = 0;
                    while (cEventos.moveToNext()) {
                        DeviceRgb bg = (rowNum % 2 == 0) ? white : rowAlt;
                        String[] vals = {
                            safe(cEventos.getString(cEventos.getColumnIndexOrThrow("fecha_evento"))),
                            safe(cEventos.getString(cEventos.getColumnIndexOrThrow("tipo_evento"))),
                            safe(cEventos.getString(cEventos.getColumnIndexOrThrow("descripcion"))),
                            safe(cEventos.getString(cEventos.getColumnIndexOrThrow("veterinario"))),
                            safe(cEventos.getString(cEventos.getColumnIndexOrThrow("observaciones"))),
                        };
                        for (String v : vals) {
                            evTable.addCell(new Cell()
                                .add(new Paragraph(v).setFontSize(8))
                                .setBackgroundColor(bg).setPadding(4));
                        }
                        rowNum++;
                    }
                    document.add(evTable);
                    document.add(new Paragraph(" "));
                }
                if (cEventos != null) cEventos.close();

                // ── SECCIÓN 3: Resumen de Gastos ──────────────────────────
                addSectionTitle(document, "Resumen de Gastos", green, white);

                if (cGastos == null || cGastos.getCount() == 0) {
                    document.add(new Paragraph("Sin gastos registrados.")
                        .setFontSize(10).setFontColor(grayText).setMarginTop(6).setMarginBottom(12));
                } else {
                    float[] gCols = {2.5f, 4f, 2f, 2f};
                    Table gTable = new Table(UnitValue.createPercentArray(gCols))
                        .setWidth(UnitValue.createPercentValue(100));
                    for (String h : new String[]{"Categoria", "Descripcion", "Monto MXN", "Fecha"}) {
                        gTable.addHeaderCell(new Cell()
                            .add(new Paragraph(h).setBold().setFontColor(white).setFontSize(9))
                            .setBackgroundColor(green).setTextAlignment(TextAlignment.CENTER).setPadding(5));
                    }
                    int rowNum = 0;
                    while (cGastos.moveToNext()) {
                        DeviceRgb bg    = (rowNum % 2 == 0) ? white : rowAlt;
                        String    cat   = safe(cGastos.getString(cGastos.getColumnIndexOrThrow("categoria")));
                        String    desc  = safe(cGastos.getString(cGastos.getColumnIndexOrThrow("descripcion")));
                        int       idxM  = cGastos.getColumnIndexOrThrow("monto");
                        double    monto = cGastos.isNull(idxM) ? 0.0 : cGastos.getDouble(idxM);
                        String    fecha = safe(cGastos.getString(cGastos.getColumnIndexOrThrow("fecha")));

                        String[]        vals   = {cat, desc, String.format(Locale.US, "$%.2f", monto), fecha};
                        TextAlignment[] aligns = {
                            TextAlignment.LEFT, TextAlignment.LEFT,
                            TextAlignment.RIGHT, TextAlignment.CENTER
                        };
                        for (int c = 0; c < vals.length; c++) {
                            gTable.addCell(new Cell()
                                .add(new Paragraph(vals[c]).setFontSize(8))
                                .setBackgroundColor(bg).setTextAlignment(aligns[c]).setPadding(4));
                        }
                        rowNum++;
                    }
                    // Fila de total en negrita
                    gTable.addCell(new Cell(1, 3)
                        .add(new Paragraph("Inversion Total").setBold().setFontSize(10))
                        .setBackgroundColor(totalBg).setPadding(7));
                    gTable.addCell(new Cell()
                        .add(new Paragraph(String.format(Locale.US, "$%,.2f MXN", totalGastos))
                            .setBold().setFontSize(10))
                        .setBackgroundColor(totalBg).setTextAlignment(TextAlignment.RIGHT).setPadding(7));
                    document.add(gTable);
                }
                if (cGastos != null) cGastos.close();

                // Footer
                document.add(new Paragraph("\nAgroApp v1.0 — Offline-First — com.agroappreact")
                    .setFontSize(8).setFontColor(footerGray)
                    .setTextAlignment(TextAlignment.CENTER).setMarginTop(28));

                document.close();

                // 6. Retornar ruta absoluta
                promise.resolve(pdfFile.getAbsolutePath());

            } catch (Exception e) {
                promise.reject("PDF_ERROR", e.getMessage(), e);
            }
        });
    }

    @ReactMethod
    public void generateHistorialPdf(double animalIdDouble, Promise promise) {
        executor.execute(() -> {
            try {
                int animalId = (int) animalIdDouble;
                ReactApplicationContext context = getReactApplicationContext();
                SQLiteDatabase db = DatabaseHelper.getInstance(context).getReadableDatabase();

                // 1. Datos básicos del animal
                Cursor cAnimal = db.rawQuery(
                    "SELECT numero_arete, especie, estado " +
                    "FROM animales WHERE id = ?",
                    new String[]{String.valueOf(animalId)}
                );
                if (cAnimal == null || !cAnimal.moveToFirst()) {
                    if (cAnimal != null) cAnimal.close();
                    promise.reject("PDF_ERROR", "Animal no encontrado con id: " + animalId);
                    return;
                }
                String arete   = safe(cAnimal.getString(cAnimal.getColumnIndexOrThrow("numero_arete")));
                String especie = safe(cAnimal.getString(cAnimal.getColumnIndexOrThrow("especie")));
                String estado  = safe(cAnimal.getString(cAnimal.getColumnIndexOrThrow("estado")));
                cAnimal.close();

                // 2. Todos los eventos sanitarios del animal (cronológico DESC)
                Cursor cEventos = db.rawQuery(
                    "SELECT tipo_evento, descripcion, fecha_evento, " +
                    "       veterinario, dosis, observaciones, fecha_proximo_evento " +
                    "FROM eventos_sanitarios " +
                    "WHERE animal_id = ? ORDER BY fecha_evento DESC",
                    new String[]{String.valueOf(animalId)}
                );

                // 3. Historial clínico complementario
                Cursor cHistorial = db.rawQuery(
                    "SELECT fecha, enfermedad, sintomas, tratamiento, observaciones " +
                    "FROM historial_clinico " +
                    "WHERE animal_id = ? ORDER BY fecha DESC",
                    new String[]{String.valueOf(animalId)}
                );

                // Directorio y nombre de archivo
                File docsDir = context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS);
                if (docsDir == null) docsDir = context.getFilesDir();
                File agroDir = new File(docsDir, "AgroApp");
                if (!agroDir.exists() && !agroDir.mkdirs()) {
                    promise.reject("PDF_ERROR", "No se pudo crear el directorio de destino.");
                    return;
                }
                String fechaNombre = new SimpleDateFormat("yyyyMMdd", Locale.US).format(new Date());
                String areteSafe   = arete.replaceAll("[^a-zA-Z0-9]", "_");
                File pdfFile       = new File(agroDir, "historial_" + areteSafe + "_" + fechaNombre + ".pdf");

                // 4. Documento iText7
                PdfWriter   writer   = new PdfWriter(pdfFile.getAbsolutePath());
                PdfDocument pdfDoc   = new PdfDocument(writer);
                Document    document = new Document(pdfDoc, PageSize.A4);
                document.setMargins(36, 36, 36, 36);

                DeviceRgb green      = new DeviceRgb(7,   97,  45);
                DeviceRgb white      = new DeviceRgb(255, 255, 255);
                DeviceRgb rowAlt     = new DeviceRgb(244, 248, 240);
                DeviceRgb grayText   = new DeviceRgb(100, 100, 100);
                DeviceRgb footerGray = new DeviceRgb(150, 150, 150);

                String ahora = new SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.US).format(new Date());

                // Encabezado del documento
                document.add(new Paragraph("AgroApp — Historial Clínico")
                    .setFontSize(18).setBold().setFontColor(green)
                    .setTextAlignment(TextAlignment.CENTER));
                document.add(new Paragraph(
                    "Arete: " + arete + "  |  Especie: " + especie +
                    "  |  Estado: " + estado + "  |  Generado: " + ahora)
                    .setFontSize(10).setFontColor(grayText)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(20));

                // ── SECCIÓN 1: Eventos Sanitarios ─────────────────────────
                addSectionTitle(document, "Eventos Sanitarios", green, white);

                int totalEventos = (cEventos != null) ? cEventos.getCount() : 0;
                if (totalEventos == 0) {
                    document.add(new Paragraph("Sin eventos sanitarios registrados.")
                        .setFontSize(10).setFontColor(grayText).setMarginTop(6).setMarginBottom(12));
                } else {
                    // Resumen numérico por tipo
                    document.add(new Paragraph("Total de eventos: " + totalEventos)
                        .setFontSize(10).setFontColor(grayText).setMarginTop(4).setMarginBottom(8));

                    float[] evCols = {2f, 2f, 3.5f, 2f, 1.5f, 3f};
                    Table evTable = new Table(UnitValue.createPercentArray(evCols))
                        .setWidth(UnitValue.createPercentValue(100));
                    for (String h : new String[]{"Fecha", "Tipo", "Descripcion", "Veterinario", "Dosis", "Observaciones"}) {
                        evTable.addHeaderCell(new Cell()
                            .add(new Paragraph(h).setBold().setFontColor(white).setFontSize(9))
                            .setBackgroundColor(green).setTextAlignment(TextAlignment.CENTER).setPadding(5));
                    }
                    int rowNum = 0;
                    while (cEventos.moveToNext()) {
                        DeviceRgb bg = (rowNum % 2 == 0) ? white : rowAlt;
                        String[] vals = {
                            safe(cEventos.getString(cEventos.getColumnIndexOrThrow("fecha_evento"))),
                            safe(cEventos.getString(cEventos.getColumnIndexOrThrow("tipo_evento"))),
                            safe(cEventos.getString(cEventos.getColumnIndexOrThrow("descripcion"))),
                            safe(cEventos.getString(cEventos.getColumnIndexOrThrow("veterinario"))),
                            safe(cEventos.getString(cEventos.getColumnIndexOrThrow("dosis"))),
                            safe(cEventos.getString(cEventos.getColumnIndexOrThrow("observaciones"))),
                        };
                        for (String v : vals) {
                            evTable.addCell(new Cell()
                                .add(new Paragraph(v).setFontSize(8))
                                .setBackgroundColor(bg).setPadding(4));
                        }
                        rowNum++;
                    }
                    document.add(evTable);
                    document.add(new Paragraph(" "));
                }
                if (cEventos != null) cEventos.close();

                // ── SECCIÓN 2: Historial Clínico ──────────────────────────
                addSectionTitle(document, "Enfermedades y Tratamientos", green, white);

                int totalHistorial = (cHistorial != null) ? cHistorial.getCount() : 0;
                if (totalHistorial == 0) {
                    document.add(new Paragraph("Sin registros de enfermedades o tratamientos.")
                        .setFontSize(10).setFontColor(grayText).setMarginTop(6).setMarginBottom(12));
                } else {
                    float[] hCols = {2f, 3f, 3f, 3f, 3f};
                    Table hTable = new Table(UnitValue.createPercentArray(hCols))
                        .setWidth(UnitValue.createPercentValue(100));
                    for (String h : new String[]{"Fecha", "Enfermedad", "Síntomas", "Tratamiento", "Observaciones"}) {
                        hTable.addHeaderCell(new Cell()
                            .add(new Paragraph(h).setBold().setFontColor(white).setFontSize(9))
                            .setBackgroundColor(green).setTextAlignment(TextAlignment.CENTER).setPadding(5));
                    }
                    int rowNum = 0;
                    while (cHistorial.moveToNext()) {
                        DeviceRgb bg = (rowNum % 2 == 0) ? white : rowAlt;
                        String[] vals = {
                            safe(cHistorial.getString(cHistorial.getColumnIndexOrThrow("fecha"))),
                            safe(cHistorial.getString(cHistorial.getColumnIndexOrThrow("enfermedad"))),
                            safe(cHistorial.getString(cHistorial.getColumnIndexOrThrow("sintomas"))),
                            safe(cHistorial.getString(cHistorial.getColumnIndexOrThrow("tratamiento"))),
                            safe(cHistorial.getString(cHistorial.getColumnIndexOrThrow("observaciones"))),
                        };
                        for (String v : vals) {
                            hTable.addCell(new Cell()
                                .add(new Paragraph(v).setFontSize(8))
                                .setBackgroundColor(bg).setPadding(4));
                        }
                        rowNum++;
                    }
                    document.add(hTable);
                }
                if (cHistorial != null) cHistorial.close();

                // Footer
                document.add(new Paragraph("\nAgroApp v1.0 — Offline-First — com.agroappreact")
                    .setFontSize(8).setFontColor(footerGray)
                    .setTextAlignment(TextAlignment.CENTER).setMarginTop(28));

                document.close();
                promise.resolve(pdfFile.getAbsolutePath());

            } catch (Exception e) {
                promise.reject("PDF_ERROR", e.getMessage(), e);
            }
        });
    }

    private void addSectionTitle(Document doc, String title,
                                 DeviceRgb bgColor, DeviceRgb textColor) {
        doc.add(new Paragraph(title)
            .setBold()
            .setFontSize(11)
            .setFontColor(textColor)
            .setBackgroundColor(bgColor)
            .setPaddingLeft(10)
            .setPaddingTop(6)
            .setPaddingBottom(6)
            .setMarginBottom(0));
    }

    private String safe(String value) {
        return (value != null && !value.isEmpty()) ? value : "—";
    }
}
