# Bases de la aplicacion para migrarla a web

## Resumen general
AgroApp React es una aplicacion hecha en React Native con enfoque offline-first para gestion ganadera. La app esta pensada para celular, pero su logica principal puede servir como base para una version web si se separa bien la capa de datos nativos y la navegacion movil.

## Estructura principal
- El punto de entrada es [App.tsx](../App.tsx), que monta el proveedor de safe area y delega todo a [src/navigation/AppNavigator.tsx](../src/navigation/AppNavigator.tsx).
- La navegacion principal no usa una app web tradicional; usa un flujo propio por estados: `startup`, `auth`, `home` y modulos como `animals`, `health`, `costs`, `reports` y `notifications`.
- La pantalla inicial carga un splash, valida la sesion y luego abre el modulo principal.

## Lo que sostiene la app hoy
- La persistencia local depende de `AsyncStorage` para la sesion y estados auxiliares.
- La logica de negocio depende de `NativeModules` para hablar con modulos en Java.
- El almacenamiento real de datos parece estar en una base local, probablemente SQLite, expuesta por esos modulos nativos.
- La app usa `AppState` para detectar cuando pasa a segundo plano y volver a validar la sesion.

## Modulos y capas importantes
- **Animales:** inventario, busqueda, historial, cambio de estado y operaciones CRUD.
- **Sanitario:** eventos clinicos, calendario, historial, proximas fechas y registros.
- **Costos:** gestion de gastos, resumen e indicadores financieros.
- **Inicio:** dashboard con resumen de inventario, alertas y tareas proximas.
- **Autenticacion:** flujo de acceso local con bloqueo por tiempo de inactividad.

## Dependencias que no se pueden llevar igual a web
- `NativeModules` y cualquier bridge Java/React Native.
- `react-native-image-picker`.
- `@react-native-community/datetimepicker`.
- Cualquier modulo nativo para PDF, camara, notificaciones o permisos del sistema.
- La logica que dependa de `AppState` tal como existe en movil.

## Lo que si conviene conservar
- La separacion por dominio: animales, sanitario, costos, home y auth.
- Los modelos de datos y tipos de negocio.
- Los calculos de dashboard, filtros, historiales y proximas tareas.
- La idea de trabajar offline, aunque en web se tendra que reemplazar la capa de persistencia.

## Lo que habria que reescribir para web
- La capa de acceso a datos nativos.
- La persistencia local de SQLite expuesta por Java.
- La navegacion movil por una navegacion web con rutas reales.
- Los modulos de camara, PDF, notificaciones y permisos.
- El manejo de sesion para usar almacenamiento web y eventos del navegador.

## Propuesta de base para web
1. Separar la logica de negocio de la capa nativa.
2. Crear una capa de datos web con IndexedDB, localStorage o una API backend.
3. Migrar la navegacion a React web con rutas por pantalla.
4. Mantener los componentes de dominio y adaptar la UI a escritorio y responsive.
5. Reemplazar funciones nativas por servicios web equivalentes.

## Conclusion
La base funcional de la app no es la interfaz movil sino la logica de gestion ganadera y el modelo offline-first. Para web, lo mas valioso es conservar los dominios, tipos y reglas de negocio, y reemplazar por completo los bridges nativos y la persistencia local de Android/iOS.