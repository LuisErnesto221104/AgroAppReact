# IDENTIDAD VISUAL

## Tipografía y Paleta de Colores Oficial

**AgroApp v1.0 — Sección 3.4**


| Atributo          | Detalle                                                                   |
| :---------------- | :------------------------------------------------------------------------ |
| **Proyecto**      | AgroApp — Sistema Móvil de Gestión Ganadera Offline-First para Android |
| **Documento**     | Guía de Identidad Visual — Tipografía y Paleta de Colores              |
| **Versión**      | 1.0 (21 de Marzo de 2026)                                                 |
| **Elaborado por** | Tapia Romero Jovani (Diseño UI/UX) · Cervantes Quiroz Ángel Gerardo    |
| **Aprobado por**  | Gómez Martínez Luis Ernesto (QC Lead)                                   |
| **Institución**  | Instituto Tecnológico de Zitácuaro                                      |

## 1. Logotipo AgroApp

El logotipo de AgroApp se compone de dos elementos indisociables: el wordmark **"Agro App"** en Poppins Bold y el **ícono de cabeza de toro estilizada en blanco**. Ambos elementos deben aparecer siempre juntos según la regla de composición.

### 1.1 Composición y reglas de uso


| Variante                 | Composición                           | Cuándo usar                                                                                           |
| :----------------------- | :------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| **Positivo (principal)** | Fondo verde`#07612d` · Logo blanco    | Pantallas de la app, splash screen, AppBar, encabezados principales.                                   |
| **Negativo**             | Fondo blanco · Logo en verde`#07612d` | Documentos impresos, fondos claros, manuales en papel.                                                 |
| **Solo ícono**          | Ícono toro únicamente                | Únicamente como favicon, ícono de app launcher o notificación push. Nunca en pantallas principales. |

---

## 2. Tipografía Oficial

La fuente oficial de AgroApp es **Poppins Bold**. Fue seleccionada por su legibilidad en pantallas de dispositivos de gama media-baja y su claridad bajo condiciones de luz solar directa en campo abierto, cumpliendo con el requisito **RNF002**.

* **Fuente disponible en:** [Google Fonts - Poppins](https://fonts.google.com/specimen/Poppins)
* **Licencia:** Open Font License (OFL). Gratuita para uso comercial y académico.

### 2.1 Familia tipográfica — pesos disponibles


| Peso    | Nombre           | Tamaño ref. | Uso en la app                                                         |
| :------ | :--------------- | :----------- | :-------------------------------------------------------------------- |
| **700** | Poppins Bold     | 32–24 sp    | Nombre de la app (splash), títulos de pantalla, botones principales. |
| **600** | Poppins SemiBold | 18 sp        | Subtítulos, encabezados de sección, número de arete SINIIGA.       |
| **400** | Poppins Regular  | 14 sp        | Texto de cuerpo, campos de formulario, descripciones.                 |
| **300** | Poppins Light    | 12 sp        | Texto secundario, fechas, notas al pie, placeholders.                 |

### 2.2 Jerarquía tipográfica completa en la app


| Elemento UI                | Fuente           | Tamaño | Color                                 |
| :------------------------- | :--------------- | :------ | :------------------------------------ |
| Nombre app (splash screen) | Poppins Bold     | 32 sp   | Blanco`#ffffff` sobre fondo `#07612d` |
| Título de pantalla        | Poppins Bold     | 24 sp   | Verde corporativo`#07612d`            |
| Encabezado de sección     | Poppins SemiBold | 18 sp   | Verde corporativo`#07612d`            |
| Etiqueta de campo (label)  | Poppins SemiBold | 14 sp   | Verde musgo`#98a287`                  |
| Texto de cuerpo            | Poppins Regular  | 14 sp   | Negro tipográfico`#1d1d1b`           |
| Texto de botón principal  | Poppins Bold     | 16 sp   | Blanco`#ffffff` sobre fondo `#07612d` |
| Número de arete SINIIGA   | Poppins Bold     | 18 sp   | Verde corporativo`#07612d`            |
| Texto secundario / nota    | Poppins Light    | 12 sp   | Verde musgo`#98a287`                  |
| Mensaje de error           | Poppins SemiBold | 14 sp   | Rojo`#D32F2F`                         |
| Placeholder en campos      | Poppins Regular  | 14 sp   | `#1d1d1b` al 60% de opacidad          |

### 2.3 Reglas tipográficas obligatorias

* Usar exclusivamente Poppins en toda la interfaz de la app. Ningún componente debe usar la fuente del sistema por defecto.
* El tamaño mínimo de texto legible es **12 sp**, sin excepciones (requisito RNF002 — legibilidad bajo luz solar).
* El interlineado debe ser al menos **1.5×** el tamaño de la fuente para garantizar legibilidad en campo.
* En campos de formulario, el placeholder debe tener opacidad al **60%** para diferenciarse del texto ingresado.
* Los botones primarios siempre usan Poppins Bold 16 sp en blanco sobre fondo verde `#07612d`.
* Nunca mezclar Poppins con otras fuentes en la misma pantalla.

---

## 3. Paleta de Colores Oficial

Los siguientes valores de color provienen directamente de la guía de estilo 3.4 del proyecto. Son los **únicos colores autorizados** para la interfaz de AgroApp. Cualquier variación debe ser aprobada por el QC Lead (Gómez M. Luis Ernesto).

### 3.1 Colores primarios


| Color     | Nombre                    | Valores CMYK                  | Uso principal                                                     |
| :-------- | :------------------------ | :---------------------------- | :---------------------------------------------------------------- |
| `#07612d` | Verde corporativo AgroApp | C:0 · M:265 · Y:386 · K:37 | Color principal — headers, botones primarios, logotipo, acentos. |
| `#1d1d1b` | Negro tipográfico        | C:0 · M:0 · Y:0 · K:100    | Texto de cuerpo, iconografía, fondo modo oscuro.                 |
| `#ffffff` | Blanco                    | C:0 · M:0 · Y:0 · K:0      | Fondos de pantalla, texto sobre fondos oscuros.                   |
| `#98a287` | Verde musgo / gris verde  | C:0 · M:22 · Y:32 · K:?    | Elementos secundarios, labels, fondos de tarjetas, separadores.   |

### 3.2 Colores de estado y sistema


| Nombre                       | HEX       | Uso específico                                                             |
| :--------------------------- | :-------- | :-------------------------------------------------------------------------- |
| Verde éxito / confirmación | `#4CAF50` | Mensajes de guardado exitoso, íconos de completado, DoD cumplido.          |
| Rojo error / crítico        | `#D32F2F` | Errores de validación, animal fallecido, notificación urgente mismo día. |
| Ámbar / advertencia         | `#FFA000` | Recordatorios 3 días antes de eventos sanitarios, eventos pendientes.      |
| Gris claro (fondo listas)    | `#F4F4F4` | Fondo de pantallas de listado, separadores sutiles.                         |
| Verde corporativo 15% opac.  | `#07612d` | Fondo de tarjetas de animales activos (transparencia).                      |

### 3.3 Aplicación de colores en la interfaz


| Elemento UI                          | Color              | HEX       |
| :----------------------------------- | :----------------- | :-------- |
| Barra superior (AppBar)              | Verde corporativo  | `#07612d` |
| Botón primario (Guardar, Registrar) | Verde corporativo  | `#07612d` |
| Texto en botón primario             | Blanco             | `#ffffff` |
| Fondo de pantalla general            | Blanco             | `#ffffff` |
| Texto principal (cuerpo)             | Negro tipográfico | `#1d1d1b` |
| Texto secundario / labels            | Verde musgo        | `#98a287` |
| Estado: Animal activo                | Verde corporativo  | `#07612d` |
| Estado: Animal vendido               | Verde musgo        | `#98a287` |
| Estado: Animal fallecido             | Negro tipográfico | `#1d1d1b` |
| Notificación urgente (mismo día)   | Rojo               | `#D32F2F` |
| Notificación próxima (3 días)     | Ámbar             | `#FFA000` |
| Íconos de navegación activos       | Verde corporativo  | `#07612d` |
| Íconos de navegación inactivos     | Verde musgo        | `#98a287` |

---

## 4. Contrastes y Accesibilidad (RNF002)

El requisito **RNF002** establece que la interfaz debe ser legible bajo luz solar directa en potreros. Las siguientes combinaciones de color han sido evaluadas contra el estándar WCAG 2.1:


| Combinación                                     | Ratio contraste | Cumple WCAG                           |
| :----------------------------------------------- | :-------------- | :------------------------------------ |
| Blanco (`#ffffff`) sobre Verde corp. (`#07612d`) | ~7.5:1          | ✅ AAA — Uso irrestricto             |
| Negro (`#1d1d1b`) sobre Blanco (`#ffffff`)       | ~19:1           | ✅ AAA — Uso irrestricto             |
| Blanco (`#ffffff`) sobre Negro (`#1d1d1b`)       | ~19:1           | ✅ AAA — Uso irrestricto             |
| Blanco (`#ffffff`) sobre Verde musgo (`#98a287`) | ~2.8:1          | ⚠️ Solo texto grande (≥ 18sp bold) |
| Negro (`#1d1d1b`) sobre Verde musgo (`#98a287`)  | ~4.1:1          | ✅ AA — Solo para texto secundario   |

> **Regla crítica:** El texto de cuerpo (14sp) y los labels de botón NUNCA deben aparecer sobre el color `#98a287`. Ese color está reservado exclusivamente para elementos decorativos y texto de apoyo de gran tamaño.

---

## 5. Implementación en React Native

Las siguientes constantes deben integrarse en el archivo `src/utils/theme.js` del proyecto. Este archivo es la **única fuente de verdad** de colores y tipografía para todos los componentes React Native de AgroApp.

### 5.1 Archivo `src/utils/theme.js`

```javascript
export const COLORS = { 
  primary: '#07612d', 
  black: '#1d1d1b', 
  white: '#ffffff', 
  gray: '#98a287', 
  error: '#D32F2F', 
  warning: '#FFA000', 
  success: '#4CAF50' 
};
```


### 

5.2 Instalación de la fuente Poppins

1. Descargar los 4 archivos `.ttf` desde Google Fonts (`Poppins-Light.ttf`, `Poppins-Regular.ttf`, `Poppins-SemiBold.ttf`, `Poppins-Bold.ttf`).
2. Copiar los archivos a: `android/app/src/main/assets/fonts/`
3. Ejecutar: `npx react-native link` para registrar las fuentes en el proyecto Android.
4. Uso en componentes: `fontFamily: 'Poppins-Bold' | 'Poppins-SemiBold' | 'Poppins-Regular' | 'Poppins-Light'`

---

## 6. Checklist de Consistencia Visual (QC)

Antes de cerrar cualquier Pull Request que toque pantallas de la app, el QC Lead (Gómez M.) debe verificar:

* [ ]  Todos los textos usan la fuente Poppins (ningún texto en fuente del sistema).
* [ ]  Los botones primarios usan el color `#07612d` con texto blanco.
* [ ]  Los encabezados de pantalla usan `#07612d` (nunca negro puro).
* [ ]  El texto de cuerpo usa `#1d1d1b` (nunca el negro del sistema por defecto).
* [ ]  No hay texto blanco sobre el color `#98a287`.
* [ ]  El tamaño mínimo de fuente es 12sp en toda la app.
* [ ]  Los estados de animales usan los colores correctos (activo/vendido/fallecido).
* [ ]  Las notificaciones urgentes son rojas (`#D32F2F`), las próximas son ámbar (`#FFA000`).
* [ ]  El logotipo siempre aparece con ícono + texto, nunca solo el texto.
* [ ]  Los íconos de navegación activos son `#07612d`, inactivos son `#98a287`.
