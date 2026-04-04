# AgroApp 🐂📱
**Sistema Móvil de Gestión Ganadera Offline-First**

AgroApp es una aplicación móvil híbrida (React Native + Java) diseñada para facilitar la administración clínica y financiera de ganado bovino en zonas rurales sin acceso a internet (Zitácuaro y Ocampo, Michoacán). Utiliza una arquitectura *Offline-first* basada en una base de datos local SQLite, conectada a la interfaz mediante *Native Modules* (Bridge JS ↔ Java).

---

## 🛠 Requisitos del Entorno

Para compilar y ejecutar este proyecto en local, necesitas tener instaladas las siguientes herramientas con sus versiones específicas:

* **Node.js:** `v24.13.0`
* **npm:** `11.6.2`
* **Java Development Kit (JDK):** Versión `21`
* **Android Studio:** Koala 2024.1.1 (Requerido para el entorno de emulación y compilación nativa).
  * Android SDK: `API 34` (Android 14)
  * NDK: `27.1.12297006` (Para la compilación de módulos nativos)
* **macOS / Xcode:** Requerido *únicamente* si deseas compilar la versión para iOS.

---

## ⚙️ Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/LuisErnesto221104/AgroAppReact.git](https://github.com/LuisErnesto221104/AgroAppReact.git)
   cd AgroAppReact
