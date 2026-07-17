# SGP — Spec de Historias de Usuario (XP)

> Metodología de ingeniería: **Extreme Programming (XP)**.
> Este documento es el **spec** del sistema: reemplaza el documento de requisitos largo
> por **user stories** en el formato XP (Card / Conversation / Confirmation).
> Fuente: `docs/requisitos.md`, `docs/dbml/sgp.dbml`, `docs/metodologia.md`.

## Cómo leer este spec (convenciones XP)

- **Formato de cada story**: `Como <rol>, quiero <acción> para <valor>`.
- **Las 3 C de Ron Jeffries**:
  - **Card**: la historia (lo que lees aquí).
  - **Conversation**: el detalle se negocia cara a cara con el cliente cuando se implementa.
  - **Confirmation**: criterios de aceptación al pie de cada story; drivan los tests automatizados.
- **Estimación**: tiempo ideal en semanas (1–3). >3 semanas ⇒ se descompone; <1 ⇒ se junta.
- **INVEST** (Bill Wake): cada story debe ser Independiente, Negociable, Valiosa, Estimable,
  Pequeña, Testeable.
- **Alcance por rol** (del SRS §1): Coordinador→su PNF; Docente→sus grupos; Alumno→su proyecto;
  buscador de resúmenes→PNF propio.

---

## Épicas y stories

### Épica A — Acceso y seguridad (Auth & RBAC)

**A1. Login y sesión**
> Como usuario registrado, quiero iniciar sesión con mi email o DNI y contraseña,
> para obtener un token y acceder al sistema.

- Estimación: 1 semana.
- Confirmación:
  - POST /auth/login acepta email o dni + password y devuelve JWT pair + usuario.
  - Refresh token renueva la sesión; logout invalida la sesión (`user_sessions`).
  - Credenciales inválidas → 401.

**A2. Recuperación de acceso por preguntas de seguridad**
> Como usuario, quiero responder mis preguntas de seguridad para restablecer mi contraseña,
> para recuperar el acceso si lo olvido.

- Estimación: 1 semana.
- Confirmación:
  - El usuario tiene `user_questions` con `answerHash`.
  - Flujo emite `user_tokens` tipo PASSWORD_RESET y valida el hash antes de resetear.

**A3. Gestión de roles y permisos**
> Como administrador, quiero asignar roles (COORDINADOR, DOCENTE, ALUMNO) y permisos a usuarios,
> para controlar qué pueden hacer en el sistema.

- Estimación: 2 semanas.
- Confirmación:
  - `roles`, `permissions`, `role_permissions`, `user_roles` operativos vía endpoints.
  - El guard JwtAuthGuard + RBAC bloquea rutas sin permiso.

---

### Épica B — Estructura académica (catálogos)

**B1. Gestión de instituciones, periodos y PNFs**
> Como coordinador, quiero crear y editar instituciones, periodos y PNFs,
> para organizar la estructura académica de mi entorno.

- Estimación: 2 semanas.
- Confirmación:
  - `periods` con `(institutionId, code)` único y `isActive`.
  - Al editar un PNF se puede asignar `coordinatorId` (profesor coordinador).

**B2. Trayectorias y materias**
> Como coordinador, quiero definir trayectorias y materias por PNF,
> para estructurar los programas de estudio.

- Estimación: 1 semana.
- Confirmación:
  - `trajectories` con `orderNumber`; `subjects` ligados a trayectoria.

---

### Épica C — Actores: profesores y estudiantes

**C1. Perfil de profesor**
> Como profesor, quiero completar mi perfil (especialización) y ver en qué grupos participo,
> para gestionar mis asignaciones y tutorías.

- Estimación: 1 semana.
- Confirmación:
  - `professors` 1:1 con `users`; el docente ve grupos donde imparte o tutora.

**C2. Perfil de estudiante**
> Como estudiante, quiero que mi perfil refleje mi trayectoria, número de matrícula y cohorte,
> para estar correctamente inscrito en proyectos.

- Estimación: 1 semana.
- Confirmación:
  - `students` con `enrollmentNumber` único, `trajectoryId`, `cohort`.

---

### Épica D — Asignaciones, proyectos y tutores

**D1. Asignación docente a materia**
> Como coordinador, quiero asignar un profesor para impartir una materia en un periodo/sección,
> para que quede definido quién es el docente de cada grupo.

- Estimación: 1 semana.
- Confirmación:
  - `project_subject_assignments` única por `(subjectId, professorId, periodId)`.
  - `professorId` = quien imparte esa asignación.

**D2. Registro de proyecto**
> Como estudiante, quiero registrar mi proyecto (título, descripción, problemStatement,
> asignación, lugar y tutor comunitario), para iniciar el seguimiento académico.

- Estimación: 2 semanas.
- Confirmación:
  - `projects` con `communityTutorId` **obligatorio** y único (1 solo tutor comunitario).
  - `status` inicia en BORRADOR.

**D3. Asignación de tutores académicos (con regla de exclusión)**
> Como coordinador, quiero asignar tutores académicos a un proyecto,
> para que guíen al grupo sin confligo de interés.

- Estimación: 1 semana.
- Confirmación (regla de negocio corrección 2):
  - Un `professorId` en `project_academic_tutors` **NO** puede coincidir con
    `project.subjectAssignment.professorId` (el que imparte esa asignación no tutora esos grupos).
  - SÍ puede tutorar otros grupos de distinta sección/trimestre/trayecto.
  - El backend rechaza la asignación inválida con 422.

**D4. Autores del proyecto**
> Como estudiante, quiero registrar los autores de mi proyecto con su orden,
> para reflejar la autoría académica.

- Estimación: 1 semana.
- Confirmación:
  - `project_authors` con `(projectId, studentId)` único y `authorOrder`.

---

### Épica E — Comunidad y tutores comunitarios

**E1. Lugares comunitarios**
> Como coordinador, quiero registrar lugares comunitarios (comunidad, organización, institución, empresa),
> para vincular proyectos con su contexto.

- Estimación: 1 semana.
- Confirmación:
  - `community_places` por institución con tipo, dirección y contacto.

**E2. Tutores comunitarios**
> Como coordinador, quiero registrar tutores comunitarios por lugar,
> para asignar el responsable de cada proyecto en la comunidad/empresa.

- Estimación: 1 semana.
- Confirmación:
  - `community_tutors` por `locationId`; asignados 1:1 al proyecto vía `projects.communityTutorId`.

---

### Épica F — Buscador de resúmenes (antecedentes)

**F1. Explorar resúmenes por tags dentro de mi PNF**
> Como alumno, quiero buscar resúmenes de proyectos culminados de mi PNF filtrando por tags
> (tecnología, tema, tutor, metodología), para usarlos como antecedentes metodológicos.

- Estimación: 2 semanas.
- Confirmación:
  - Resultados **acotados al PNF del usuario logueado** (todos los roles logueados pueden buscar).
  - Muestra **metadatos** (título, autores, metodología, tags, estado); el `RESUMEN` es **descargable**.
  - Filtro por `tags` (category: TECNOLOGIA | TEMA | TUTOR | METODOLOGIA) vía `project_tags`.

**F2. Etiquetado de proyectos**
> Como usuario, quiero asociar tags a un proyecto,
> para que sea encontrrable en el buscador de antecedentes.

- Estimación: 1 semana. *(Pendiente P1: definir quién crea/edita tags.)*
- Confirmación:
  - `tags` + `project_tags` operativos; al menos creación libre por ahora.

---

### Épica G — Seguimiento: hitos, archivos y correcciones

**G1. Subir RESUMEN y TOMO**
> Como estudiante, quiero subir el RESUMEN y el TOMO de mi proyecto (versionado),
> para entregar y recibir retroalimentación.

- Estimación: 1 semana.
- Confirmación:
  - `project_files.documentType` solo `RESUMEN | TOMO`; `version` incremental; `uploadedBy`.

**G2. Hitos del proyecto**
> Como tutor, quiero crear y seguir hitos (type, stage, status, dueDate),
> para monitorear el avance del proyecto.

- Estimación: 1 semana.
- Confirmación:
  - `project_milestones.type` ∈ {ENTREGA_TOMO, REVISION, OTRA};
    `status` ∈ {PENDIENTE, EN_REVISION, APROBADO, RECHAZADO}.
  - `project_revisions` registra transición `statusBefore→statusAfter`.

**G3. Correcciones sobre el TOMO**
> Como tutor, quiero comentar el TOMO y marcar correcciones como resueltas al re-subirse,
> para verificar que el grupo atendió la retroalimentación.

- Estimación: 1 semana.
- Confirmación (flujo §9 SRS):
  1. Grupo sube TOMO (`version` +1).
  2. Tutor crea `project_corrections` `status=PENDIENTE` ligadas al `fileId` (TOMO).
  3. Tutor marca `RESUELTA` (`resolvedAt`) tras verificar la re-subida.

---

### Épica H — Defensa y evaluación

**H1. Agendar defensa**
> Como docente (quien imparte la asignación), quiero programar la defensa de un proyecto,
> para fijar la fecha de evaluación.

- Estimación: 1 semana.
- Confirmación:
  - `defenses` 1:1 con proyecto; `status` ∈ {PROGRAMADA, REALIZADA, APLAZADA, CANCELADA}.
  - Solo el docente de la asignación puede agendar.

**H2. Jurados y evaluación**
> Como docente, quiero conformar el jurado (docente que imparte, tutor académico, tutor comunitario)
> y registrar las evaluaciones, para calificar la defensa.

- Estimación: 2 semanas.
- Confirmación:
  - `defense_judges` con exactamente 1 de `professorId` o `communityTutorId`
    (`judgeType`: SUBJECT_PROFESSOR | ACADEMIC_TUTOR | COMMUNITY_TUTOR); los 3 obligatorios.
  - `defense_evaluations` 1 por juez con `score` decimal(5,2).
  - `defense_schedule_changes` registra reprogramaciones con `reason`.

---

### Épica I — Certificación

**I1. Certificado de culminación**
> Como estudiante, quiero obtener mi certificado de culminación en PDF,
> para acreditar la finalización del proyecto.

- Estimación: 1 semana.
- Confirmación:
  - `completion_certificates` con `pdfUrl` por `authorId` único.

---

### Épica J — Notificaciones y auditoría

**J1. Notificaciones**
> Como usuario, quiero recibir notificaciones de eventos de mis proyectos,
> para mantenerme al tanto.

- Estimación: 1 semana.
- Confirmación:
  - `notifications` con `readAt`; marcable como leída.

**J2. Auditoría**
> Como administrador, quiero registro de auditoría de acciones,
> para trazabilidad y seguridad.

- Estimación: 1 semana.
- Confirmación:
  - `activity_logs` con `action`, `entityType/Id`, `details` (json), `ip`, `userAgent`.

---

## Backlog y conteo (referencia XP: ~80±20 stories por release)

- Épicas: 10. Stories individuales: **28** (A1–A3, B1–B2, C1–C2, D1–D4, E1–E2, F1–F2,
  G1–G3, H1–H2, I1, J1–J2).
- Estimación total ideal: ~38 semanas-hombre (sumando rangos). Candidadas a descomponer
  en iteraciones: A3, B1, D2, F1, H2 (≈2 semanas cada una).

## Criterios de aceptación transversales (Definition of Done, XP)

1. Cada story tiene al menos 1 test automatizado (backend jest / e2e; frontend vitest).
2. Lint limpio (tseslint type-checked backend; ESLint flat frontend).
3. Visibilidad por alcance respetada (coordinador→PNF, docente→grupos, alumno→proyecto).
4. Sin `console.log` en backend; usar `Logger`.
5. Path aliases obligatorios (`@modules/*`, `@/*`).

## Pendientes que afectan stories

- **P1** (F2): quién crea/edita tags.
- **P2** (D3): validación backend regla profesor-imparte ≠ tutor — ya incluida en Confirmación de D3.
- **P4** (sección 14 SRS): mecanismo de registro de usuarios y asignación de coordinador —
  necesario antes de A1/A3; decidir Opción A (admin) + C (CSV).
