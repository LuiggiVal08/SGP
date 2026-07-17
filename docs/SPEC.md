# SGP — Especificación de Sistema (Metodología XP)

> **Sistema de Gestión de Proyectos Socio-Integradores**
> Coordinación de Informática — UPTT "Mario Briceño Iragorry" (Núcleo Boconó)
> Versión del documento: 1.0 — Junio 2026

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Roles del Sistema](#2-roles-del-sistema)
3. [Plan de Entrega (Release Plan)](#3-plan-de-entrega-release-plan)
4. [Historias de Usuario](#4-historias-de-usuario)
   - [Rol: Estudiante (STUDENT)](#41-estudiante-student)
   - [Rol: Tutor Académico (TUTOR)](#42-tutor-académico-tutor)
   - [Rol: Administrador / Coordinador (ADMIN / IRCOP)](#43-administrador--coordinador-admin--ircop)
   - [Historias Transversales](#44-historias-transversales)
5. [Criterios de Aceptación Globales](#5-criterios-de-aceptación-globales)
6. [Glosario](#6-glosario)

---

## 1. Introducción

### 1.1 Propósito del Documento

Este documento especifica el sistema **SGP (Sistema de Gestión de Proyectos Socio-Integradores)** utilizando la metodología **eXtreme Programming (XP)**. Describe las historias de usuario, el plan de entrega por releases y los criterios de aceptación que guían el desarrollo del sistema.

### 1.2 Descripción del Sistema

SGP es una aplicación web full-stack para la gestión del ciclo de vida de los **Proyectos Socio-Integradores (PSI)** —equivalentes a tesis de grado— en la Coordinación de Informática de la UPTT "Mario Briceño Iragorry". El sistema permite:

- Autenticación segura con JWT y recuperación de contraseña mediante preguntas de seguridad.
- Registro y seguimiento de proyectos con múltiples autores, tutor académico y tutor comunitario.
- Carga y gestión de archivos (PDF de tesis, código fuente, plan de negocio) en almacenamiento S3 (MinIO).
- Panel de administración para gestión de usuarios, instituciones, programas de formación (PNF) y bitácora de actividades.
- Dashboard con estadísticas y gráficos del estado de los proyectos.
- Sistema de notificaciones, evaluaciones con rúbricas, chat interno y catálogo público (planificados).

### 1.3 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, TypeScript, Vite 8, HeroUI, Tailwind CSS v4, TanStack Query, Zustand |
| Backend | NestJS 11, TypeScript, Sequelize (ORM), MySQL 8 |
| Almacenamiento | MinIO (S3-compatible) para archivos, MySQL para datos relacionales |
| Cache | Redis 7 |
| Proxy | Nginx (con rate limiting) |
| Contenedores | Docker Compose |

---

## 2. Roles del Sistema

| Rol | Descripción | Permisos base |
|-----|-------------|---------------|
| **STUDENT** | Estudiante que presenta un proyecto socio-integrador | Crear/ver/editar sus proyectos, subir archivos, ver dashboard, gestionar su perfil |
| **TUTOR** | Docente tutor académico que supervisa proyectos | Ver proyectos asignados, gestionar estudiantes, actualizar estado de proyectos |
| **ADMIN** | Administrador del sistema | CRUD completo de usuarios, instituciones, PNF; gestión de bitácora; todas las operaciones de TUTOR |
| **IRCOP** | Coordinador (equivalente funcional a ADMIN) | Mismos permisos que ADMIN |

---

## 3. Plan de Entrega (Release Plan)

El desarrollo se organiza en **4 releases** con **11 iteraciones** en total. Cada release entrega un conjunto cohesivo de funcionalidades listas para producción.

| Release | Iteraciones | Historias | Esfuerzo estimado | Dependencias |
|---------|-------------|-----------|-------------------|--------------|
| **R1: Core y Autenticación** | 2 iters (1-2) | US-AUTH-01 al 08, US-PRO-01 al 04, US-TRA-01 | ~40 puntos | Ninguna |
| **R2: Gestión de Proyectos** | 3 iters (3-5) | US-STU-01 al 12, US-TUT-01 al 04, US-PRO-05 | ~60 puntos | R1 |
| **R3: Administración** | 2 iters (6-7) | US-ADM-01 al 12 | ~40 puntos | R1 |
| **R4: Avanzado** | 4 iters (8-11) | US-NOT-01, US-EVAL-01 al 05, US-COM-01 al 03, US-PUB-01 al 02, US-INF-01 | ~80 puntos | R2, R3 |

### 3.1 Criterios de Evaluación de Releases

Cada release se considera completo cuando:
- Todas las historias planificadas están implementadas y pasan sus criterios de aceptación.
- Las pruebas unitarias y de integración existentes pasan sin regresiones.
- El frontend compila sin errores de TypeScript (`tsc -b`).
- El linter no reporta errores (`npm run lint` en backend y frontend).
- El despliegue con `docker compose up -d --build` funciona correctamente.

---

## 4. Historias de Usuario

### 4.1 Estudiante (STUDENT)

#### Módulo: Autenticación

---

##### US-STU-01: Inicio de sesión

| Campo | Valor |
|-------|-------|
| **ID** | US-STU-01 |
| **Título** | Inicio de sesión |
| **Descripción** | Como estudiante, quiero iniciar sesión con mi correo electrónico y contraseña para acceder al sistema. |
| **Prioridad** | Alta |
| **Release** | R1 |
| **Dependencias** | Ninguna |
| **Esfuerzo** | 3 puntos |

**Criterios de aceptación:**

1. **Formulario de login:** El sistema muestra un formulario con campos de `email` y `password`, y un botón "Iniciar sesión".
2. **Validación de campos:** Si el email está vacío o no tiene formato válido, se muestra un mensaje de error. Si la contraseña está vacía, se muestra un mensaje de error.
3. **Credenciales inválidas:** Si el email no existe o la contraseña es incorrecta, se muestra el mensaje: "Credenciales inválidas".
4. **Usuario inactivo:** Si la cuenta está desactivada (`isActive = false`), se muestra: "Tu cuenta ha sido desactivada. Contacta al administrador".
5. **Rate limiting:** Tras 5 intentos fallidos por minuto, la IP es bloqueada temporalmente (código 429).
6. **Login exitoso:** Al autenticarse correctamente, el sistema retorna un par de tokens JWT (access + refresh) y los datos del usuario. El frontend redirige al dashboard.
7. **Persistencia de sesión:** Los tokens se almacenan en `localStorage` y se restauran al recargar la página.
8. **Expiración de sesión:** Cuando el access token expira (15 min), el frontend lo renueva automáticamente usando el refresh token.
9. **Carga:** El tiempo de respuesta del endpoint `/auth/login` no supera los 2 segundos bajo condiciones normales.

---

##### US-STU-02: Cierre de sesión

| Campo | Valor |
|-------|-------|
| **ID** | US-STU-02 |
| **Título** | Cierre de sesión |
| **Descripción** | Como estudiante, quiero cerrar sesión para salir del sistema de forma segura. |
| **Prioridad** | Alta |
| **Release** | R1 |
| **Dependencias** | US-STU-01 |
| **Esfuerzo** | 1 punto |

**Criterios de aceptación:**

1. El sistema muestra un botón "Cerrar sesión" en el menú de usuario (avatar o sidebar).
2. Al hacer clic, se invoca `POST /auth/logout` para invalidar el refresh token en Redis.
3. Los tokens se eliminan del `localStorage`.
4. El usuario es redirigido a la página de login.
5. Si el usuario navega directamente al dashboard sin tokens, es redirigido al login.

---

##### US-STU-03: Recuperación de contraseña — Paso 1 (Iniciar)

| Campo | Valor |
|-------|-------|
| **ID** | US-STU-03 |
| **Título** | Recuperación de contraseña: solicitar restablecimiento |
| **Descripción** | Como estudiante, quiero solicitar el restablecimiento de mi contraseña proporcionando mi correo electrónico para recuperar el acceso si la he olvidado. |
| **Prioridad** | Alta |
| **Release** | R1 |
| **Dependencias** | US-STU-01 |
| **Esfuerzo** | 2 puntos |

**Criterios de aceptación:**

1. En la página de login hay un enlace "¿Olvidaste tu contraseña?".
2. Al hacer clic, se muestra un formulario que solicita el correo electrónico.
3. Si el email no existe en el sistema, se muestra: "Si el correo está registrado, recibirás instrucciones".
4. Si el email existe, el backend genera un JWT temporal (`resetToken`) con propósito `password_reset_init` y devuelve las preguntas de seguridad del usuario.
5. El frontend avanza al paso 2 mostrando las preguntas de seguridad.
6. El token temporal expira a los 5 minutos.

---

##### US-STU-04: Recuperación de contraseña — Paso 2 (Verificar preguntas)

| Campo | Valor |
|-------|-------|
| **ID** | US-STU-04 |
| **Título** | Recuperación de contraseña: verificar respuestas de seguridad |
| **Descripción** | Como estudiante, quiero responder mis preguntas de seguridad para verificar mi identidad al restablecer mi contraseña. |
| **Prioridad** | Alta |
| **Release** | R1 |
| **Dependencias** | US-STU-03 |
| **Esfuerzo** | 2 puntos |

**Criterios de aceptación:**

1. Se muestran al usuario las 3 preguntas de seguridad registradas en su cuenta.
2. Cada respuesta se normaliza (se eliminan espacios al inicio/final y se convierte a minúsculas) antes de comparar.
3. Si alguna respuesta es incorrecta, se muestra: "Respuesta incorrecta. Intenta de nuevo".
4. Si las 3 respuestas son correctas, el backend genera un nuevo JWT (`verificationToken`) con propósito `password_reset_verify`.
5. El frontend avanza al paso 3 (nueva contraseña).
6. Si el `resetToken` expira, se muestra un error y se solicita reiniciar el proceso.

---

##### US-STU-05: Recuperación de contraseña — Paso 3 (Restablecer)

| Campo | Valor |
|-------|-------|
| **ID** | US-STU-05 |
| **Título** | Recuperación de contraseña: establecer nueva contraseña |
| **Descripción** | Como estudiante, quiero establecer una nueva contraseña después de verificar mi identidad para recuperar el acceso a mi cuenta. |
| **Prioridad** | Alta |
| **Release** | R1 |
| **Dependencias** | US-STU-04 |
| **Esfuerzo** | 1 punto |

**Criterios de aceptación:**

1. Se muestra un formulario con campos: `newPassword` y `confirmPassword`.
2. La contraseña debe tener al menos 8 caracteres.
3. Si `newPassword !== confirmPassword`, se muestra: "Las contraseñas no coinciden".
4. Al enviar, el backend hashea la nueva contraseña con bcrypt (10 rondas) y la actualiza.
5. Si el `verificationToken` expiró, se muestra error y se reinicia el proceso.
6. Tras el restablecimiento exitoso, se redirige al login con un mensaje: "Contraseña actualizada exitosamente. Inicia sesión".

---

##### US-STU-06: Cambio de contraseña estando autenticado

| Campo | Valor |
|-------|-------|
| **ID** | US-STU-06 |
| **Título** | Cambio de contraseña |
| **Descripción** | Como estudiante autenticado, quiero cambiar mi contraseña desde mi perfil para mantener la seguridad de mi cuenta. |
| **Prioridad** | Media |
| **Release** | R1 |
| **Dependencias** | US-STU-01 |
| **Esfuerzo** | 1 punto |

**Criterios de aceptación:**

1. En la página de perfil hay una sección "Cambiar contraseña" con campos: `currentPassword`, `newPassword`, `confirmPassword`.
2. Si `currentPassword` es incorrecta, se muestra: "Contraseña actual incorrecta".
3. `newPassword` debe tener al menos 8 caracteres.
4. Si `newPassword !== confirmPassword`, se muestra: "Las contraseñas no coinciden".
5. Tras el cambio exitoso, se muestra una notificación toast de éxito.
6. El refresh token se invalida y se solicita al usuario iniciar sesión nuevamente.

---

#### Módulo: Perfil

---

##### US-STU-07: Ver perfil

| Campo | Valor |
|-------|-------|
| **ID** | US-STU-07 |
| **Título** | Ver mi perfil |
| **Descripción** | Como estudiante, quiero ver mi información de perfil (nombre, email, teléfono, PNF, institución) para confirmar mis datos. |
| **Prioridad** | Alta |
| **Release** | R1 |
| **Dependencias** | US-STU-01 |
| **Esfuerzo** | 1 punto |

**Criterios de aceptación:**

1. La página de perfil (`/profile`) es accesible desde el menú de usuario.
2. Muestra: nombres, apellidos, email, teléfono, cédula (DNI), PNF, institución y rol.
3. Los campos de solo lectura (email, rol, institución, PNF) no son editables.
4. Los datos se cargan desde `GET /users/me`.

---

##### US-STU-08: Editar perfil

| Campo | Valor |
|-------|-------|
| **ID** | US-STU-08 |
| **Título** | Editar mi perfil |
| **Descripción** | Como estudiante, quiero editar mi información personal (teléfono, nombres, apellidos) para mantener mis datos actualizados. |
| **Prioridad** | Media |
| **Release** | R1 |
| **Dependencias** | US-STU-07 |
| **Esfuerzo** | 1 punto |

**Criterios de aceptación:**

1. Los campos editables (nombres, apellidos, teléfono) tienen un botón "Guardar".
2. La validación de formato de teléfono se realiza con `react-phone-number-input`.
3. Al guardar, se invoca `PATCH /users/me` y los cambios persisten en la base de datos.
4. Se muestra una notificación toast de éxito o error.
5. Los datos del perfil se actualizan en la vista sin necesidad de recargar.

---

##### US-STU-09: Gestionar preguntas de seguridad

| Campo | Valor |
|-------|-------|
| **ID** | US-STU-09 |
| **Título** | Gestionar preguntas de seguridad |
| **Descripción** | Como estudiante, quiero registrar o actualizar mis 3 preguntas de seguridad para poder recuperar mi contraseña en el futuro. |
| **Prioridad** | Media |
| **Release** | R1 |
| **Dependencias** | US-STU-01, US-STU-03 |
| **Esfuerzo** | 2 puntos |

**Criterios de aceptación:**

1. En la página de perfil hay una sección "Preguntas de seguridad".
2. Se cargan las preguntas disponibles desde `GET /security-questions`.
3. El usuario selecciona 3 preguntas de un listado (no pueden repetirse).
4. Cada respuesta debe tener al menos 2 caracteres.
5. Al guardar, las respuestas se normalizan y hashean antes de almacenarse.
6. Si el usuario ya tenía preguntas registradas, se muestran actuales (con respuestas ocultas).
7. Se requiere la contraseña actual para modificar las preguntas de seguridad.

---

#### Módulo: Proyectos

---

##### US-STU-10: Registrar un proyecto

| Campo | Valor |
|-------|-------|
| **ID** | US-STU-10 |
| **Título** | Registrar un nuevo proyecto |
| **Descripción** | Como estudiante, quiero registrar un nuevo proyecto socio-integrador proporcionando título, año, PNF, autores y tutor académico para iniciar el proceso de gestión. |
| **Prioridad** | Alta |
| **Release** | R2 |
| **Dependencias** | US-STU-01, US-STU-07 |
| **Esfuerzo** | 5 puntos |

**Criterios de aceptación:**

1. **Acceso:** La opción "Nuevo proyecto" está disponible en el dashboard y en la lista de proyectos.
2. **Formulario:** El registro es un wizard multi-paso con los siguientes campos:
   - **Paso 1:** Título (obligatorio, máx. 255 caracteres), año (obligatorio, numérico 4 dígitos), PNF (selector, obligatorio).
   - **Paso 2:** Autores del proyecto: mínimo 2, máximo 3 autores (5 si el flag `isExceptional` está activo). Cada autor se selecciona de usuarios existentes con rol STUDENT.
   - **Paso 3:** Tutor académico (selector de usuarios con rol TUTOR, obligatorio).
   - **Paso 4:** Tutor comunitario (opcional): nombre completo, cédula, teléfono, email, organización, cargo.
3. **Validaciones:**
   - El título no puede estar duplicado (validación backend).
   - No se puede agregar al mismo usuario dos veces como autor.
   - El estudiante que crea el proyecto se agrega automáticamente como autor.
4. **Confirmación:** Al crear, se muestra un resumen del proyecto y se redirige a la página de detalle.
5. **Estado inicial:** El proyecto se crea con estado `PENDING_VALIDATION`.

---

##### US-STU-11: Listar mis proyectos

| Campo | Valor |
|-------|-------|
| **ID** | US-STU-11 |
| **Título** | Listar mis proyectos |
| **Descripción** | Como estudiante, quiero ver una lista de todos los proyectos en los que soy autor para darles seguimiento. |
| **Prioridad** | Alta |
| **Release** | R2 |
| **Dependencias** | US-STU-01 |
| **Esfuerzo** | 2 puntos |

**Criterios de aceptación:**

1. La página `/projects` muestra una tabla paginada con los proyectos del estudiante.
2. Columnas: título, año, PNF, tutor, estado, fecha de creación.
3. El estado se muestra con badges de colores:
   - `PENDING_VALIDATION` → amarillo/naranja.
   - `COMPLETED` → verde.
   - `REJECTED` → rojo.
4. Se puede filtrar por: año, estado, PNF y texto de búsqueda (título).
5. La paginación muestra 10 proyectos por página (configurable hasta 100).
6. Cada fila es cliqueable y redirige al detalle del proyecto.

---

##### US-STU-12: Ver detalle de un proyecto

| Campo | Valor |
|-------|-------|
| **ID** | US-STU-12 |
| **Título** | Ver detalle de un proyecto |
| **Descripción** | Como estudiante, quiero ver la información completa de un proyecto, incluyendo autores, archivos y tutor comunitario, para conocer su estado actual. |
| **Prioridad** | Alta |
| **Release** | R2 |
| **Dependencias** | US-STU-11 |
| **Esfuerzo** | 2 puntos |

**Criterios de aceptación:**

1. La página de detalle (`/projects/:id`) muestra:
   - Título, año, PNF, estado, fecha de creación.
   - Lista de autores con nombre, email y cédula.
   - Tutor académico con nombre, email y teléfono.
   - Tutor comunitario (si existe) con datos completos.
   - Archivos subidos con tipo, nombre, fecha y enlace de descarga.
2. El breadcrumb muestra "Proyectos > [Título del proyecto]".
3. Si el usuario no es autor ni tutor ni admin, se muestra error 403.

---

##### US-STU-13: Editar un proyecto

| Campo | Valor |
|-------|-------|
| **ID** | US-STU-13 |
| **Título** | Editar un proyecto |
| **Descripción** | Como estudiante, quiero editar los datos de mi proyecto (título, año, autores, tutor) para corregir o actualizar información. |
| **Prioridad** | Alta |
| **Release** | R2 |
| **Dependencias** | US-STU-12 |
| **Esfuerzo** | 3 puntos |

**Criterios de aceptación:**

1. Solo los autores del proyecto y el administrador pueden editar.
2. Los campos editables son: título, año, PNF, autores, tutor académico, tutor comunitario.
3. No se puede cambiar el estado desde la edición.
4. Al guardar, se muestra notificación toast de éxito.
5. Si otro autor ya no está en el proyecto, se elimina su relación (no se elimina el usuario).

---

##### US-STU-14: Subir archivos a un proyecto

| Campo | Valor |
|-------|-------|
| **ID** | US-STU-14 |
| **Título** | Subir archivos a un proyecto |
| **Descripción** | Como estudiante, quiero subir archivos (PDF de tesis, código fuente, plan de negocio) a mi proyecto para adjuntar la documentación requerida. |
| **Prioridad** | Alta |
| **Release** | R2 |
| **Dependencias** | US-STU-12 |
| **Esfuerzo** | 4 puntos |

**Criterios de aceptación:**

1. En la página de detalle del proyecto hay una sección "Archivos" con un área de upload (drag & drop con `react-dropzone`).
2. Tipos de archivo permitidos: `THESIS_PDF`, `SOURCE_CODE`, `BUSINESS_PLAN`.
3. Límite de tamaño: 50 MB por archivo.
4. Los archivos se suben secuencialmente (uno a la vez) con barra de progreso individual.
5. Solo se permite subir un archivo por tipo (ej: solo un `THESIS_PDF` por proyecto).
6. Al completar la subida, el archivo aparece en la lista con nombre, tipo, fecha y enlace.
7. Si el archivo excede 50 MB o el tipo no es válido, se muestra error.
8. Los archivos se almacenan en MinIO (bucket `sgp-uploads/`) en producción o en el sistema de archivos local en desarrollo.
9. Los archivos subidos tienen visibilidad pública (lectura sin autenticación).

---

##### US-STU-15: Eliminar archivos de un proyecto

| Campo | Valor |
|-------|-------|
| **ID** | US-STU-15 |
| **Título** | Eliminar archivos de un proyecto |
| **Descripción** | Como estudiante, quiero eliminar un archivo que haya subido a mi proyecto para reemplazarlo o corregir un error. |
| **Prioridad** | Media |
| **Release** | R2 |
| **Dependencias** | US-STU-14 |
| **Esfuerzo** | 2 puntos |

**Criterios de aceptación:**

1. Cada archivo en la lista tiene un botón "Eliminar".
2. Al hacer clic, se muestra un modal de confirmación: "¿Estás seguro de eliminar este archivo?".
3. Al confirmar, se elimina el archivo del almacenamiento (MinIO/filesystem) y el registro de `project_files`.
4. Se muestra notificación toast de éxito.
5. Si el archivo no se encuentra en el almacenamiento pero existe en BD, se elimina el registro igualmente.

---

##### US-STU-16: Ver dashboard

| Campo | Valor |
|-------|-------|
| **ID** | US-STU-16 |
| **Título** | Ver dashboard del sistema |
| **Descripción** | Como estudiante, quiero ver un dashboard con estadísticas generales de proyectos (total, por estado, por año) para tener una visión general del sistema. |
| **Prioridad** | Media |
| **Release** | R2 |
| **Dependencias** | US-STU-01 |
| **Esfuerzo** | 3 puntos |

**Criterios de aceptación:**

1. La página principal (`/`) muestra un dashboard.
2. Tarjetas de estadísticas: total de proyectos, por estado (pendientes, completados, rechazados), por año.
3. Los datos se cargan desde `GET /projects/stats`.
4. Los gráficos se renderizan con Recharts (gráfico de barras para proyectos por año, gráfico de dona para proyectos por estado).
5. Los datos se cachean en Redis por 1 hora.
6. El dashboard tiene animaciones de entrada (framer-motion) y fondo decorativo.
7. En caso de error de carga, se muestra un mensaje amigable y un botón de reintentar.

---

#### Módulo: Notificaciones (Futuro)

---

##### US-STU-17: Recibir notificaciones

| Campo | Valor |
|-------|-------|
| **ID** | US-STU-17 |
| **Título** | Recibir notificaciones del sistema |
| **Descripción** | Como estudiante, quiero recibir notificaciones en la aplicación (y opcionalmente por email) cuando el estado de mi proyecto cambie o cuando haya novedades. |
| **Prioridad** | Baja |
| **Release** | R4 |
| **Dependencias** | US-STU-12 |
| **Esfuerzo** | 5 puntos |

**Criterios de aceptación:**

1. El sistema muestra un ícono de campana en el navbar con un contador de notificaciones no leídas.
2. Las notificaciones se generan automáticamente cuando: el estado del proyecto cambia, se sube un archivo, se agrega un comentario.
3. Al hacer clic en la campana, se despliega un panel con las últimas 20 notificaciones.
4. Cada notificación tiene: ícono, título, descripción breve, timestamp y enlace al recurso relacionado.
5. Las notificaciones se marcan como leídas al hacer clic.
6. Opcional: envío de email para notificaciones importantes (cambio de estado).

---

### 4.2 Tutor Académico (TUTOR)

---

##### US-TUT-01: Ver proyectos asignados

| Campo | Valor |
|-------|-------|
| **ID** | US-TUT-01 |
| **Título** | Ver proyectos asignados como tutor |
| **Descripción** | Como tutor académico, quiero ver una lista de los proyectos donde soy tutor para darles seguimiento. |
| **Prioridad** | Alta |
| **Release** | R2 |
| **Dependencias** | US-STU-01 |
| **Esfuerzo** | 2 puntos |

**Criterios de aceptación:**

1. La página `/projects` filtra automáticamente los proyectos donde el usuario es tutor.
2. El tutor puede cambiar el filtro para ver todos los proyectos del sistema.
3. Las columnas y funcionalidades son las mismas que US-STU-11.
4. Se muestra un badge "Tutor" junto al nombre del tutor en cada fila.

---

##### US-TUT-02: Ver detalle de proyecto como tutor

| Campo | Valor |
|-------|-------|
| **ID** | US-TUT-02 |
| **Título** | Ver detalle de proyecto como tutor |
| **Descripción** | Como tutor académico, quiero ver el detalle completo de un proyecto que tutoré para revisar su progreso y archivos. |
| **Prioridad** | Alta |
| **Release** | R2 |
| **Dependencias** | US-TUT-01 |
| **Esfuerzo** | 1 punto |

**Criterios de aceptación:**

1. El tutor puede acceder al detalle de cualquier proyecto donde figure como tutor.
2. La vista es idéntica a US-STU-12 pero incluye acciones adicionales: cambiar estado.
3. Los archivos pueden ser previsualizados o descargados por el tutor.

---

##### US-TUT-03: Cambiar estado de un proyecto

| Campo | Valor |
|-------|-------|
| **ID** | US-TUT-03 |
| **Título** | Cambiar estado de un proyecto |
| **Descripción** | Como tutor académico, quiero cambiar el estado de un proyecto (a COMPLETED o REJECTED) para indicar su avance o resultado. |
| **Prioridad** | Alta |
| **Release** | R2 |
| **Dependencias** | US-TUT-02 |
| **Esfuerzo** | 2 puntos |

**Criterios de aceptación:**

1. En la página de detalle del proyecto, el tutor ve un selector de estado.
2. Los estados disponibles son: `PENDING_VALIDATION` → `COMPLETED` o `REJECTED`.
3. No se puede volver de `COMPLETED`/`REJECTED` a `PENDING_VALIDATION`.
4. Al cambiar, se muestra un modal de confirmación con el nuevo estado.
5. Se registra la acción en la bitácora de actividades.
6. El estudiante autor recibe la actualización en tiempo real (o al recargar).

---

##### US-TUT-04: Gestionar estudiantes como tutor

| Campo | Valor |
|-------|-------|
| **ID** | US-TUT-04 |
| **Título** | Gestionar estudiantes como tutor |
| **Descripción** | Como tutor académico, quiero ver los estudiantes que tutoré y sus proyectos para organizar mi carga académica. |
| **Prioridad** | Baja |
| **Release** | R4 |
| **Dependencias** | US-TUT-01 |
| **Esfuerzo** | 3 puntos |

**Criterios de aceptación:**

1. El tutor puede ver una lista de estudiantes únicos (sin duplicados) que tienen proyectos bajo su tutoría.
2. Al seleccionar un estudiante, se muestran sus proyectos.
3. La lista incluye: nombre del estudiante, email, cantidad de proyectos, estado del proyecto más reciente.

---

### 4.3 Administrador / Coordinador (ADMIN / IRCOP)

#### Módulo: Autenticación y Seguridad

---

##### US-ADM-01: Listar usuarios

| Campo | Valor |
|-------|-------|
| **ID** | US-ADM-01 |
| **Título** | Listar usuarios del sistema |
| **Descripción** | Como administrador, quiero ver una lista paginada de todos los usuarios del sistema para gestionarlos. |
| **Prioridad** | Alta |
| **Release** | R3 |
| **Dependencias** | US-STU-01 |
| **Esfuerzo** | 2 puntos |

**Criterios de aceptación:**

1. La página `/admin/users` es accesible solo para ADMIN e IRCOP.
2. Muestra una tabla con: nombres, apellidos, email, cédula, rol, PNF, institución, estado (activo/inactivo).
3. Se puede filtrar por: rol, PNF, institución, texto de búsqueda (nombre o email).
4. Paginación: 10 usuarios por página (configurable).
5. Los usuarios inactivos se muestran con un indicador visual (ej: tachado o gris).

---

##### US-ADM-02: Registrar un usuario

| Campo | Valor |
|-------|-------|
| **ID** | US-ADM-02 |
| **Título** | Registrar un nuevo usuario |
| **Descripción** | Como administrador, quiero registrar un nuevo usuario (estudiante, tutor u otro administrador) en el sistema para que pueda acceder. |
| **Prioridad** | Alta |
| **Release** | R3 |
| **Dependencias** | US-ADM-01 |
| **Esfuerzo** | 3 puntos |

**Criterios de aceptación:**

1. El formulario de registro incluye: nombres, apellidos, email, cédula (DNI), teléfono, rol, PNF, institución.
2. La contraseña inicial se genera automáticamente (o se envía por email).
3. Validaciones:
   - `email` debe ser único.
   - `dni` (cédula) debe ser único.
   - El email debe tener formato válido.
4. Al crear, se muestra notificación toast de éxito.
5. Si el email o cédula ya existen, se muestra error: "El email/cédula ya está registrado".

---

##### US-ADM-03: Editar un usuario

| Campo | Valor |
|-------|-------|
| **ID** | US-ADM-03 |
| **Título** | Editar un usuario existente |
| **Descripción** | Como administrador, quiero editar los datos de un usuario (nombre, email, rol, PNF, etc.) para corregir o actualizar información. |
| **Prioridad** | Alta |
| **Release** | R3 |
| **Dependencias** | US-ADM-01 |
| **Esfuerzo** | 1 punto |

**Criterios de aceptación:**

1. Cada fila de usuario tiene un botón "Editar".
2. Se abre un modal o página con el formulario precargado.
3. El administrador puede modificar: nombres, apellidos, email, teléfono, rol, PNF, institución.
4. No se puede cambiar la contraseña desde aquí (el usuario lo hace desde su perfil).
5. Al guardar, se muestra notificación toast de éxito.

---

##### US-ADM-04: Activar / desactivar un usuario

| Campo | Valor |
|-------|-------|
| **ID** | US-ADM-04 |
| **Título** | Activar o desactivar un usuario |
| **Descripción** | Como administrador, quiero activar o desactivar un usuario para controlar quién puede acceder al sistema. |
| **Prioridad** | Alta |
| **Release** | R3 |
| **Dependencias** | US-ADM-01 |
| **Esfuerzo** | 1 punto |

**Criterios de aceptación:**

1. Cada fila de usuario tiene un switch o botón "Activar/Desactivar".
2. Al cambiarlo, se invoca `PATCH /users/:id/toggle-active`.
3. Se muestra un modal de confirmación: "¿Estás seguro de [activar/desactivar] a [nombre]?".
4. Un usuario desactivado no puede iniciar sesión (ver US-STU-01 criterio 4).
5. Un administrador no puede desactivarse a sí mismo.
6. Se muestra notificación toast de éxito.

---

##### US-ADM-05: Eliminar un usuario

| Campo | Valor |
|-------|-------|
| **ID** | US-ADM-05 |
| **Título** | Eliminar un usuario |
| **Descripción** | Como administrador, quiero eliminar un usuario del sistema para mantener la base de datos limpia. |
| **Prioridad** | Media |
| **Release** | R3 |
| **Dependencias** | US-ADM-01 |
| **Esfuerzo** | 1 punto |

**Criterios de aceptación:**

1. Cada fila de usuario tiene un botón "Eliminar".
2. Al hacer clic, se muestra un modal de confirmación.
3. Si el usuario tiene proyectos asociados, se muestra una advertencia: "Este usuario tiene proyectos asociados. ¿Estás seguro de eliminarlo?".
4. Un administrador no puede eliminarse a sí mismo.
5. Al confirmar, se elimina el usuario (cascada: relaciones en project_authors, user_questions, activity_logs).
6. Se muestra notificación toast de éxito.

---

#### Módulo: Instituciones

---

##### US-ADM-06: Gestionar instituciones

| Campo | Valor |
|-------|-------|
| **ID** | US-ADM-06 |
| **Título** | Gestionar instituciones |
| **Descripción** | Como administrador, quiero crear, listar, editar y eliminar instituciones para mantener el catálogo de organizaciones asociadas. |
| **Prioridad** | Alta |
| **Release** | R3 |
| **Dependencias** | US-STU-01 |
| **Esfuerzo** | 3 puntos |

**Criterios de aceptación:**

1. **Listar:** Tabla paginada con nombre, acrónimo, email, información de contacto.
2. **Crear:** Formulario con: nombre (obligatorio), acrónimo (obligatorio), email, información de contacto.
3. **Editar:** Modal con formulario precargado.
4. **Eliminar:**
   - Solo si no hay usuarios asociados a la institución.
   - Si hay usuarios, se muestra: "No se puede eliminar: [N] usuarios están asociados a esta institución".
5. Los datos se cachean en Redis por 24 horas.
6. Al crear/editar/eliminar, se invalida la caché.

---

#### Módulo: PNF (Programas Nacionales de Formación)

---

##### US-ADM-07: Gestionar PNF

| Campo | Valor |
|-------|-------|
| **ID** | US-ADM-07 |
| **Título** | Gestionar PNF (Programas Nacionales de Formación) |
| **Descripción** | Como administrador, quiero crear, listar, editar y eliminar PNF para mantener el catálogo de programas de formación. |
| **Prioridad** | Alta |
| **Release** | R3 |
| **Dependencias** | US-STU-01 |
| **Esfuerzo** | 3 puntos |

**Criterios de aceptación:**

1. **Listar:** Tabla paginada con nombre e institución asociada. Filtrable por institución.
2. **Crear:** Formulario con: nombre (obligatorio), institución (selector, obligatorio).
3. **Editar:** Modal con formulario precargado.
4. **Eliminar:**
   - Solo si no hay usuarios ni proyectos asociados al PNF.
   - Si hay dependencias, se muestra mensaje con la cantidad de usuarios/proyectos bloqueantes.
5. Los datos se cachean en Redis por 24 horas.
6. Al crear/editar/eliminar, se invalida la caché.

---

#### Módulo: Roles

---

##### US-ADM-08: Listar roles

| Campo | Valor |
|-------|-------|
| **ID** | US-ADM-08 |
| **Título** | Listar roles del sistema |
| **Descripción** | Como administrador, quiero ver los roles disponibles en el sistema para comprender la estructura de permisos. |
| **Prioridad** | Baja |
| **Release** | R3 |
| **Dependencias** | US-STU-01 |
| **Esfuerzo** | 1 punto |

**Criterios de aceptación:**

1. `GET /roles` devuelve la lista de roles: ADMIN, IRCOP, STUDENT, TUTOR.
2. La vista muestra: nombre del rol y descripción.
3. No se puede crear, editar ni eliminar roles desde la UI (son fijos).

---

#### Módulo: Bitácora de Actividades

---

##### US-ADM-09: Ver bitácora de actividades

| Campo | Valor |
|-------|-------|
| **ID** | US-ADM-09 |
| **Título** | Ver bitácora de actividades |
| **Descripción** | Como administrador, quiero ver un registro cronológico de todas las acciones realizadas en el sistema para auditoría. |
| **Prioridad** | Media |
| **Release** | R3 |
| **Dependencias** | US-STU-01 |
| **Esfuerzo** | 3 puntos |

**Criterios de aceptación:**

1. La página `/admin/activity-log` muestra una tabla paginada con: fecha/hora, usuario que realizó la acción, tipo de acción (CREAR, ACTUALIZAR, ELIMINAR, etc.), entidad afectada, ID de la entidad, descripción.
2. Se puede filtrar por: tipo de acción, entidad, usuario, rango de fechas.
3. La tabla está ordenada por fecha descendente (más reciente primero).
4. Las acciones elegibles para logging son: CREATE, UPDATE, DELETE, TOGGLE_ACTIVE, UPLOAD, STATUS_CHANGE.
5. Las entidades elegibles son: USER, PROJECT, INSTITUTION, PNF, FILE.
6. Los detalles adicionales (cambios específicos) se almacenan en formato JSON en el campo `details`.

---

#### Módulo: Proyectos (Admin)

---

##### US-ADM-10: Gestionar proyectos (admin)

| Campo | Valor |
|-------|-------|
| **ID** | US-ADM-10 |
| **Título** | Gestionar proyectos como administrador |
| **Descripción** | Como administrador, quiero ver, editar, cambiar estado y eliminar cualquier proyecto del sistema para mantener el control total. |
| **Prioridad** | Alta |
| **Release** | R3 |
| **Dependencias** | US-STU-11, US-STU-12, US-STU-13 |
| **Esfuerzo** | 2 puntos |

**Criterios de aceptación:**

1. El administrador ve todos los proyectos del sistema (sin filtro por tutor).
2. Puede editar cualquier proyecto.
3. Puede cambiar el estado de cualquier proyecto (incluyendo volver a PENDING_VALIDATION).
4. Puede eliminar un proyecto (solo si no tiene archivos asociados).
5. Si el proyecto tiene archivos, se muestra: "No se puede eliminar: elimina los archivos primero".

---

##### US-ADM-11: Ver dashboard completo (admin)

| Campo | Valor |
|-------|-------|
| **ID** | US-ADM-11 |
| **Título** | Ver dashboard con estadísticas globales |
| **Descripción** | Como administrador, quiero ver estadísticas globales de todos los proyectos del sistema para la toma de decisiones. |
| **Prioridad** | Alta |
| **Release** | R3 |
| **Dependencias** | US-STU-16 |
| **Esfuerzo** | 1 punto |

**Criterios de aceptación:**

1. El dashboard del administrador es el mismo que US-STU-16 pero sin filtros de autor.
2. Muestra el total de proyectos del sistema completo.
3. Los datos incluyen: total, por estado, por año, por PNF, por tutor.

---

##### US-ADM-12: Vista consolidada de administración (Futuro)

| Campo | Valor |
|-------|-------|
| **ID** | US-ADM-12 |
| **Título** | Vista consolidada de administración |
| **Descripción** | Como administrador, quiero un panel consolidado que reúna estadísticas de usuarios, proyectos, PNF e instituciones en una sola vista para tener una visión holística del sistema. |
| **Prioridad** | Baja |
| **Release** | R4 |
| **Dependencias** | US-ADM-11 |
| **Esfuerzo** | 5 puntos |

**Criterios de aceptación:**

1. El dashboard consolidado muestra widgets con:
   - Total de usuarios (activos/inactivos) con gráfico.
   - Total de proyectos por estado con gráfico.
   - Total de PNF e instituciones.
   - Últimas 10 actividades registradas.
2. Los widgets se pueden reorganizar (opcional).
3. Los datos se actualizan periódicamente (cada 5 minutos o manualmente).

---

### 4.4 Historias Transversales

Estas historias afectan a múltiples roles o son de infraestructura.

---

##### US-TRA-01: Tema oscuro / claro

| Campo | Valor |
|-------|-------|
| **ID** | US-TRA-01 |
| **Título** | Alternar entre tema oscuro y claro |
| **Descripción** | Como usuario, quiero alternar entre tema oscuro y claro para adaptar la interfaz a mis preferencias visuales o condiciones de iluminación. |
| **Prioridad** | Media |
| **Release** | R1 |
| **Dependencias** | Ninguna |
| **Esfuerzo** | 3 puntos |

**Criterios de aceptación:**

1. Hay un botón de alternancia en el navbar o sidebar.
2. Los temas disponibles son: "Claro", "Oscuro", "Sistema" (sigue la preferencia del SO).
3. La preferencia se persiste en `localStorage` (Zustand persist).
4. Todas las páginas y componentes respetan el tema actual.
5. El cambio es instantáneo sin recarga de página.
6. Los gráficos del dashboard se adaptan al tema (colores de fondo/texto).

---

##### US-TRA-02: Navegación responsive

| Campo | Valor |
|-------|-------|
| **ID** | US-TRA-02 |
| **Título** | Navegación responsive |
| **Descripción** | Como usuario, quiero que la interfaz se adapte a diferentes tamaños de pantalla (escritorio, tablet, móvil) para poder usar el sistema desde cualquier dispositivo. |
| **Prioridad** | Alta |
| **Release** | R1 |
| **Dependencias** | Ninguna |
| **Esfuerzo** | 5 puntos |

**Criterios de aceptación:**

1. En escritorio (>1024px): sidebar visible, layout completo.
2. En tablet (768-1024px): sidebar como drawer colapsable.
3. En móvil (<768px): sidebar como overlay, menú hamburguesa, tablas con scroll horizontal o vista simplificada.
4. Todos los formularios son utilizables en pantallas táctiles.
5. Los modales se muestran a pantalla completa en móvil.

---

##### US-TRA-03: Breadcrumbs de navegación

| Campo | Valor |
|-------|-------|
| **ID** | US-TRA-03 |
| **Título** | Navegación con breadcrumbs |
| **Descripción** | Como usuario, quiero ver la ruta de navegación actual (breadcrumbs) en cada página para saber dónde estoy y poder retroceder fácilmente. |
| **Prioridad** | Baja |
| **Release** | R1 |
| **Dependencias** | Ninguna |
| **Esfuerzo** | 2 puntos |

**Criterios de aceptación:**

1. Todas las páginas (excepto login) muestran breadcrumbs en la parte superior.
2. Los breadcrumbs muestran labels legibles (no UUIDs).
3. Cada nivel es cliqueable excepto el actual.

---

##### US-TRA-04: Accesibilidad básica

| Campo | Valor |
|-------|-------|
| **ID** | US-TRA-04 |
| **Título** | Accesibilidad básica de la interfaz |
| **Descripción** | Como usuario con discapacidad visual o motriz, quiero que la interfaz sea navegable por teclado y compatible con lectores de pantalla para poder usar el sistema. |
| **Prioridad** | Media |
| **Release** | R2 |
| **Dependencias** | Todas las historias de UI |
| **Esfuerzo** | 5 puntos |

**Criterios de aceptación:**

1. Todos los elementos interactivos tienen `aria-label` descriptivo.
2. Todos los campos de formulario tienen etiquetas `<label>` asociadas mediante `htmlFor`.
3. La navegación por teclado (Tab, Enter, Escape) funciona en todas las páginas.
4. Los modales atrapan el foco (focus trap) mientras están abiertos.
5. Los mensajes de error y éxito son anunciados por lectores de pantalla (role="alert").
6. El contraste de color cumple con WCAG 2.2 AA (relación de contraste ≥ 4.5:1 para texto normal).

---

##### US-EVAL-01: Sistema de rúbricas de evaluación (Futuro)

| Campo | Valor |
|-------|-------|
| **ID** | US-EVAL-01 |
| **Título** | Gestionar rúbricas de evaluación |
| **Descripción** | Como administrador, quiero crear y gestionar rúbricas de evaluación con criterios y puntajes para estandarizar la evaluación de proyectos. |
| **Prioridad** | Baja |
| **Release** | R4 |
| **Dependencias** | US-ADM-10 |
| **Esfuerzo** | 8 puntos |

**Criterios de aceptación:**

1. Las rúbricas tienen: nombre, descripción, lista de criterios con peso/puntaje máximo.
2. Se pueden crear, editar, activar/desactivar y eliminar rúbricas.
3. Una rúbrica activa puede ser asignada a proyectos.
4. Los puntajes se calculan automáticamente según los pesos.

---

##### US-EVAL-02: Programar defensa de proyecto (Futuro)

| Campo | Valor |
|-------|-------|
| **ID** | US-EVAL-02 |
| **Título** | Programar defensa de proyecto |
| **Descripción** | Como administrador, quiero programar la fecha, hora y lugar de la defensa de un proyecto, y asignar jurados. |
| **Prioridad** | Baja |
| **Release** | R4 |
| **Dependencias** | US-ADM-10 |
| **Esfuerzo** | 5 puntos |

**Criterios de aceptación:**

1. Se puede asignar una fecha, hora y lugar a un proyecto COMPLETED o PENDING_VALIDATION.
2. Se asignan 2 o 3 jurados (usuarios con rol TUTOR).
3. Los estudiantes autores y jurados reciben notificación.
4. La defensa se muestra en el detalle del proyecto.

---

##### US-EVAL-03: Evaluar proyecto con rúbrica (Futuro)

| Campo | Valor |
|-------|-------|
| **ID** | US-EVAL-03 |
| **Título** | Evaluar proyecto con rúbrica |
| **Descripción** | Como jurado, quiero evaluar un proyecto asignado utilizando una rúbrica para asignar un puntaje final. |
| **Prioridad** | Baja |
| **Release** | R4 |
| **Dependencias** | US-EVAL-01, US-EVAL-02 |
| **Esfuerzo** | 5 puntos |

**Criterios de aceptación:**

1. El jurado ve la rúbrica asignada y califica cada criterio.
2. El puntaje total se calcula automáticamente.
3. El jurado puede agregar comentarios por criterio y generales.
4. Una vez enviada, la evaluación no se puede modificar.

---

##### US-COM-01: Chat interno entre usuarios (Futuro)

| Campo | Valor |
|-------|-------|
| **ID** | US-COM-01 |
| **Título** | Chat interno entre participantes del proyecto |
| **Descripción** | Como usuario (estudiante, tutor), quiero chatear con los participantes de un proyecto para comunicarme sobre el avance del trabajo. |
| **Prioridad** | Baja |
| **Release** | R4 |
| **Dependencias** | US-STU-12 |
| **Esfuerzo** | 8 puntos |

**Criterios de aceptación:**

1. Cada proyecto tiene un chat grupal con todos los autores y el tutor.
2. Los mensajes incluyen: texto, timestamp, nombre del remitente.
3. Los mensajes nuevos aparecen en tiempo real (WebSocket o polling).
4. El historial de chat se persiste y es consultable.

---

##### US-PUB-01: Catálogo público de proyectos (Futuro)

| Campo | Valor |
|-------|-------|
| **ID** | US-PUB-01 |
| **Título** | Catálogo público de proyectos |
| **Descripción** | Como visitante no autenticado, quiero ver un catálogo público de proyectos completados para consultar los trabajos realizados. |
| **Prioridad** | Baja |
| **Release** | R4 |
| **Dependencias** | US-STU-11 |
| **Esfuerzo** | 5 puntos |

**Criterios de aceptación:**

1. La ruta `/proyectos` es pública y muestra solo proyectos con estado `COMPLETED`.
2. Muestra: título, año, PNF, autores, tutor, resumen.
3. No requiere autenticación.
4. Los archivos no son descargables desde el catálogo público (solo metadatos).

---

##### US-INF-01: Migración a buckets MinIO por entorno (Futuro)

| Campo | Valor |
|-------|-------|
| **ID** | US-INF-01 |
| **Título** | Buckets de MinIO separados por entorno |
| **Descripción** | Como administrador del sistema, quiero que los archivos se almacenen en buckets de MinIO separados por entorno (dev, staging, production) para evitar mezclar datos. |
| **Prioridad** | Baja |
| **Release** | R4 |
| **Dependencias** | US-STU-14, US-STU-15 |
| **Esfuerzo** | 3 puntos |

**Criterios de aceptación:**

1. Cada entorno tiene su propio bucket: `sgp-uploads-dev`, `sgp-uploads-staging`, `sgp-uploads-prod`.
2. La configuración se define por variable de entorno.
3. Los archivos existentes no se migran automáticamente (tarea manual única).

---

## 5. Criterios de Aceptación Globales

### 5.1 Estándares de UI/UX

| ID | Criterio |
|----|----------|
| UI-01 | Todas las páginas cargan en menos de 3 segundos en conexión de banda ancha simulada. |
| UI-02 | Los formularios muestran validación inline (errores debajo de cada campo) al perder el foco o al enviar. |
| UI-03 | Todas las acciones CRUD exitosas muestran una notificación toast. |
| UI-04 | Todas las acciones destructivas (eliminar, desactivar) muestran un modal de confirmación. |
| UI-05 | Los estados de carga muestran skeletons o spinners (HeroUI Skeleton/Spinner). |
| UI-06 | Los estados de error muestran un mensaje amigable y un botón "Reintentar" cuando sea pertinente. |
| UI-07 | Los estados vacíos (ej: no hay proyectos) muestran un mensaje informativo y una acción sugerida. |
| UI-08 | Los enlaces y botones tienen `cursor: pointer` y estado `:hover` visible. |
| UI-09 | Los formularios deshabilitan el botón de envío mientras la petición está en curso. |

### 5.2 Estándares de API

| ID | Criterio |
|----|----------|
| API-01 | Todas las respuestas siguen el formato `{ data, meta }` para colecciones y `{ data }` para recursos individuales. |
| API-02 | Los errores siguen el formato `{ statusCode, message, error }`. |
| API-03 | Los endpoints de listado soportan paginación con `?page=1&limit=10` (default 10, max 100). |
| API-04 | Los endpoints de listado soportan filtrado por campos relevantes. |
| API-05 | Los endpoints protegidos devuelven 401 si el token falta o es inválido. |
| API-06 | Los endpoints con roles devuelven 403 si el rol no tiene permiso. |
| API-07 | Los endpoints que buscan un recurso por ID devuelven 404 si no existe. |

### 5.3 Estándares de Seguridad

| ID | Criterio |
|----|----------|
| SEC-01 | Las contraseñas se almacenan hasheadas con bcrypt (10 rondas de sal). |
| SEC-02 | Los tokens JWT tienen expiración: access token 15 minutos, refresh token 7 días. |
| SEC-03 | Las respuestas de seguridad se normalizan (trim + lowercase) antes de hashear y comparar. |
| SEC-04 | El rate limiting en `/auth/login` es de 5 solicitudes por minuto por IP (configurable en Nginx). |
| SEC-05 | Los archivos subidos se validan por tipo MIME y extensión antes de almacenar. |
| SEC-06 | No se exponen contraseñas ni tokens en logs del backend. |
| SEC-07 | El frontend no almacena información sensible en texto plano (solo tokens JWT en localStorage). |

### 5.4 Estándares de Datos

| ID | Criterio |
|----|----------|
| DAT-01 | Todos los IDs de entidades son UUID v4. |
| DAT-02 | Los campos `createdAt` y `updatedAt` se gestionan automáticamente por Sequelize. |
| DAT-03 | Los valores de estado de proyecto son únicamente: `PENDING_VALIDATION`, `COMPLETED`, `REJECTED`. |
| DAT-04 | Los nombres de roles son únicamente: `ADMIN`, `IRCOP`, `STUDENT`, `TUTOR`. |
| DAT-05 | `email` y `dni` son únicos a nivel de base de datos. |

### 5.5 Estándares de Cache

| ID | Criterio |
|----|----------|
| CACHE-01 | Las listas de instituciones y PNF se cachean por 24 horas (86400 s). |
| CACHE-02 | Las listas de proyectos y estadísticas se cachean por 1 hora (3600 s). |
| CACHE-03 | La caché se invalida al crear, actualizar o eliminar la entidad correspondiente. |
| CACHE-04 | Si Redis no está disponible, el sistema funciona sin caché (fallo degradado). |

### 5.6 Estándares de Código

| ID | Criterio |
|----|----------|
| COD-01 | El backend no usa `console.log`; usa `Logger` de NestJS. |
| COD-02 | El frontend usa barrel `index.ts` para exportaciones de features (admin, catalogs). |
| COD-03 | Las rutas de importación usan path aliases (`@/*`, `@modules/*`, `@share/*`) — no `../../`. |
| COD-04 | El código pasa `tsc -b` (sin errores) y `npm run lint` (sin errores) en ambos paquetes. |

### 5.7 Estándares de Pruebas

| ID | Criterio |
|----|----------|
| TEST-01 | Cada use case del backend tiene pruebas unitarias (jest, `*.spec.ts`). |
| TEST-02 | Los esquemas de validación de formularios del frontend tienen pruebas (vitest). |
| TEST-03 | Las pruebas existentes no deben fallar al agregar nuevo código (no regresiones). |
| TEST-04 | Las pruebas E2E cubren los flujos críticos: login, creación de proyecto, subida de archivo. |

---

## 6. Glosario

| Término | Definición |
|---------|------------|
| **PSI** | Proyecto Socio-Integrador (equivalente a tesis de grado). |
| **PNF** | Programa Nacional de Formación (carrera universitaria). |
| **UPTT** | Universidad Politécnica Territorial del Estado Trujillo. |
| **Tutor académico** | Docente que supervisa académicamente el proyecto. |
| **Tutor comunitario** | Representante de la comunidad/organización donde se realiza el proyecto. |
| **JWT** | JSON Web Token — estándar de autenticación stateless. |
| **MinIO** | Almacenamiento de objetos compatible con S3. |
| **IRCOP** | Coordinador del programa (rol administrativo). |
| **STUDENT** | Estudiante autor de un proyecto. |
| **TUTOR** | Docente tutor académico. |
| **ADMIN** | Administrador del sistema. |
| **Release** | Entregable mayor del proyecto con un conjunto completo de funcionalidades. |
| **Iteración** | Ciclo de desarrollo de 1-2 semanas dentro de un release. |
| **Historia de Usuario** | Unidad funcional descripta desde la perspectiva del usuario (formato XP). |

---

> **Fin del documento** — SGP Specification v1.0
>
> Próximas revisiones: al completar cada release, actualizar historias y criterios según feedback del cliente (coordinación de informática).
