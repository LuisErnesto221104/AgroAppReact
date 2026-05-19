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

    private String safe(String value) {
        return (value != null && !value.isEmpty()) ? value : "—";
    }
}
