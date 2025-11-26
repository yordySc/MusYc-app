# 🎺 MusYc: Herramienta de Entrenamiento para Músicos de Viento 🌬️

[![GitHub repo size](https://img.shields.io/github/repo-size/yordySc/MusYc-app)](https://github.com/yordySc/MusYc-app)
[![GitHub language count](https://img.shields.io/github/languages/count/yordySc/MusYc-app)](https://github.com/yordySc/MusYc-app)
[![GitHub top language](https://img.shields.io/github/languages/top/yordySc/MusYc-app)](https://github.com/yordySc/MusYc-app)
[![GitHub last commit](https://img.shields.io/github/last-commit/yordySc/MusYc-app)](https://github.com/yordySc/MusYc-app)

## 🎯 Resumen del Proyecto

**MusYc** es una aplicación móvil especializada, diseñada para **músicos de viento** (estudiantes y profesionales de bandas y orquestas). [cite_start]Su propósito es mejorar de manera medible la técnica respiratoria, la afinación y el conocimiento del repertorio, con un énfasis especial en la música boliviana. [cite: 17, 20]

[cite_start]La aplicación está en **Desarrollo Activo** (MVP) y las funcionalidades principales ya están implementadas. [cite: 37, 38]

## 🌟 Funcionalidades Clave (MVP)

* [cite_start]**Entrenador Respiratorio:** Ejercicios guiados que operan en un ciclo de fases (**Inhala / Mantén / Exhala**). [cite: 39, 40, 382]
    * [cite_start]**Monitorización en Tiempo Real:** Utiliza el micrófono para obtener métricas de **RMS** (amplitud) y **Estabilidad** del aire. [cite: 383, 384] [cite_start]Marca el objetivo alcanzado si la media de estabilidad y RMS están entre 65–75 durante un tiempo configurable. [cite: 384, 385]
* [cite_start]**Mi Diario (Dashboard):** Registra las sesiones de práctica en la tabla `practice_logs`. [cite: 121, 377] [cite_start]Muestra resúmenes diarios y tarjetas de métricas importantes. [cite: 377, 379]
* [cite_start]**Entrenador de Oído:** Módulo de escucha y adivinación de notas con **baja latencia** gracias al *Prefetch* de MP3. [cite: 387, 390, 391] [cite_start]Guarda los resultados de las notas acertadas en el campo `description` para estadísticas. [cite: 371]
* [cite_start]**Biblioteca Musical Boliviana:** Catálogo estático del repertorio boliviano disponible para los músicos, permitiendo la descarga de partituras en PDF y visualización. [cite: 47, 49, 125]
* [cite_start]**Perfil de Usuario:** Sincronización con Supabase para gestionar el instrumento principal y preferencias (ej. Modo Oscuro). [cite: 117, 118]

## 🛠️ Tecnologías Utilizadas

| Categoría | Tecnología | Uso Específico |
| :--- | :--- | :--- |
| **Frontend** | **React Native + Expo** | [cite_start]Framework principal y manejo de *routing* con `expo-router`. [cite: 271] |
| **Lenguaje** | **TypeScript / TSX** | [cite_start]Utilizado para la robustez del código. [cite: 272, 356] |
| **Backend / DB** | **Supabase** | [cite_start]Backend-as-a-Service (BaaS) para autenticación, DB y *Storage*. [cite: 275, 356] |
| **Estado** | **Zustand** | [cite_start]Gestión de estado local y centralización de la lógica de datos (`usePracticeStore.ts`). [cite: 274, 356, 360] |
| **Audio** | **expo-av** | [cite_start]Reproducción y monitoreo de audio en baja latencia. [cite: 273] |
| **Estilos** | **nativewind + Tailwind** | [cite_start]Clases de utilidad y componentes temáticos. [cite: 277] |

## 🚀 Cómo Ejecutar el Código (Instrucciones para el Ingeniero)

Siga estos pasos para configurar y ejecutar el proyecto en su entorno local:

### 1. Requisitos Previos

Asegúrese de tener instalado **Node.js** y la **CLI de Expo** (`npm install -g expo-cli`).

### 2. Instalación de Dependencias

Ejecute este comando en la carpeta raíz del proyecto para instalar todas las dependencias definidas en `package.json`:

```bash
npm install
# o yarn install
# o pnpm install
