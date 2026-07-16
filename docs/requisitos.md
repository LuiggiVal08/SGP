# SGP — Documento de Requisitos (SRS)

> Derivado del modelo de datos `docs/dbml/sgp.dbml` (revisado 2026-07-16).
> Incluye las correcciones acordadas: 1 tutor comunitario por proyecto, regla
> profesor-imparte ≠ tutor, jerarquía por alcance (coordinador/PNF, docente, alumno),
> tags para buscador de resúmenes, y flujo de correcciones sobre el TOMO.

---

## 1. Actores y jerarquía de alcance

| Rol | Alcance de visibilidad | Origen en el modelo |
|-----|------------------------|---------------------|
| **Coordinador del PNF** | Solo los proyectos de **su PNF** | `pnfs.coordinatorId` → `professors` |
| **Docente** | Solo sus grupos: donde **imparte** (`project_subject_assignments.professorId`) o es **tutor** (`project_academic_tutors`) | `professors` + asignaciones |
| **Alumno** | Solo **su proyecto** (vía `project_authors`) | `students` → `project_authors` |
| **Todos (logueados)** | Buscador de resúmenes **acotado a su PNF** | véase módulo 7 |

La autorización combina **RBAC** (`roles` / `permissions` / `role_permissions` / `user_roles`)
con **filtrado por alcance** (regla de aplicación en el backend, no del DBML).

---

## 2. Módulo de acceso y seguridad (Auth & RBAC)

- **Autenticación**: login (email o DNI + password), refresh token, logout.
- **Sesiones activas**: `user_sessions` (device, ip, startAt, endAt, active).
- **Roles y permisos**: gestión de `roles`, `permissions`, asignación rol↔permiso.
  Roles sembrados: `COORDINADOR`, `DOCENTE`, `ALUMNO` (+ los administrativos existentes).
- **Recuperación de acceso**:
  - Preguntas de seguridad: `questions` / `user_questions` (`answerHash`).
  - Tokens: `user_tokens` (tipos `PASSWORD_RESET`, `EMAIL_VERIFY`, `SESSION`), con `used` y `expiration`.
- **Perfil de usuario**: CRUD de `users` (dni único, email único, phone, `institutionId`, isActive).

---

## 3. Estructura académica (catálogos)

- **Instituciones** (`institutions`): nombre, acrónimo, email, contacto.
- **Periodos** (`periods`): por institución, código único (`institutionId, code`), fechas, `isActive`.
- **PNFs** (`pnfs`): por institución, con `coordinatorId` (profesor coordinador).
- **Trayectorias** (`trajectories`): por PNF, con `orderNumber`.
- **Materias** (`subjects`): por trayectoria.

---

## 4. Actores: profesores y estudiantes

- **Profesores** (`professors`): perfil 1:1 con `users`, `specialization`.
  Un profesor puede ser: docente que **imparte** y/o **tutor académico**.
- **Estudiantes** (`students`): perfil 1:1 con `users`, `trajectoryId`, `enrollmentNumber` único, `cohort`.

---

## 5. Asignaciones, proyectos y tutores

- **Asignación materia-profesor-periodo** (`project_subject_assignments`):
  única por `(subjectId, professorId, periodId)`. El `professorId` es quien **imparte** esa materia a ese grupo (sección/trimestre/trayecto).
- **Proyectos** (`projects`):
  - Campos: título, descripción, `problemStatement`, `subjectAssignmentId`, `locationId`,
    `communityTutorId`, `status`, `cdSubmitted`.
  - **`communityTutorId` es obligatorio y único por proyecto** (1 solo tutor comunitario — correción 1).
- **Tutores académicos** (`project_academic_tutors`): N profesores por proyecto.
  - **Regla de negocio (correción 2)**: el `professorId` NO debe coincidir con
    `project.subjectAssignment.professorId` (el que imparte esa asignación no puede tutorar
    esos grupos). SÍ puede tutorar otros grupos de distinta sección, trimestre o trayecto.
  - Validación de aplicación en backend al asignar el tutor.
- **Autores del proyecto** (`project_authors`): estudiantes con `authorOrder`.

---

## 6. Comunidad y tutores comunitarios

- **Lugares comunitarios** (`community_places`): tipo `COMMUNITY|ORGANIZATION|INSTITUTION|COMPANY`, dirección, contacto.
- **Tutores comunitarios** (`community_tutors`): por lugar, datos personales y `position`.
  Asignación 1:1 al proyecto vía `projects.communityTutorId` (obligatorio).

---

## 7. Buscador de resúmenes (antecedentes) — *pendiente de definición de tags*

- Propósito: los alumnos consultan **resúmenes de proyectos ya culminados** de **su PNF**
  para usarlos como **antecedentes metodológicos** (ver ejemplo de "Tomo — Marco Referencial").
- El resumen se construye a partir del archivo `project_files.documentType = RESUMEN`.
- **Formato del resumen** (basado en ejemplo real):
  - Encabezado: institución, PNF, estudiantes (autores con cédula).
  - Cuerpo: objetivo principal, metodología usada, diagnóstico/problema, solución.
  - Cierre: **Palabras Clave** (ej. "herramienta tecnológica, Aplicación web, Metodología RUP").
- **Filtrado por tags** (`tags` + `project_tags`):
  - `tags`: `name`, `category` (`TECNOLOGIA | TEMA | TUTOR | METODOLOGIA`).
  - `project_tags`: relación N:N proyecto↔tag.
  - Mapeo del ejemplo: TECNOLOGIA="Aplicación web", TEMA="control de asistencias",
    METODOLOGIA="RUP", TUTOR="Casagro C.A.".
- **Visibilidad**: el buscador está disponible para todos los usuarios **logueados**,
  pero los resultados se **acotan al PNF del usuario**.
- **Resultados**: el buscador muestra **metadatos** del proyecto
  (título, autores, metodología, tags, estado), NO el texto completo.
  El resumen completo (`RESUMEN`) es **descargable** desde el resultado.
- **PENDIENTE P1**: definir quién crea/edita los tags
  (grupo alumno / coordinador-docente / libre sugerido). Por ahora se admite creación libre.

---

## 8. Seguimiento del proyecto (hitos y archivos)

- **Hitos** (`project_milestones`):
  - `type`: `ENTREGA_TOMO | REVISION | OTRA`.
  - `stage`: número de etapa.
  - `status`: `PENDIENTE | EN_REVISION | APROBADO | RECHAZADO`.
  - `dueDate`, `submittedAt`, `reviewedAt`, `approvedBy/At`.
- **Revisiones de hitos** (`project_revisions`): comentario y transición
  `statusBefore → statusAfter`, por `revisedBy`.
- **Archivos** (`project_files`): **solo 2 tipos** (`documentType`):
  - `RESUMEN`: resumen del proyecto (alimenta el buscador de antecedentes).
  - `TOMO`: documento completo, objeto de correcciones. Versionado (`version`).
- **Proyectos** (`projects.status`): `BORRADOR | EN_PROCESO | ENTREGADO | APROBADO | RECHAZADO`.

---

## 9. Correcciones sobre el TOMO (flujo de revisión)

- Nueva tabla **`project_corrections`**:
  - `fileId` → el archivo TOMO versionado (`project_files`).
  - `commentedBy` → tutor/docente que comenta.
  - `comment`, `status` (`PENDIENTE | RESUELTA`), `createdAt`, `resolvedAt`.
- **Flujo**:
  1. El grupo sube el TOMO (`project_files`, `documentType = TOMO`, `version` incremental).
  2. El tutor/docente crea correcciones (`project_corrections` con `status = PENDIENTE`)
     asociadas a ese TOMO.
  3. El grupo re-sube el TOMO (`version + 1`) y el **TUTOR** (docente/tutor académico)
     marca las correcciones como `RESUELTA` (`resolvedAt`), permitiendo verificar
     qué quedó solucionado.
- Esto da trazabilidad directa "corrección → ¿resuelta?" sin acoplarse a hitos.

---

## 10. Defensa y evaluación

- **Defensas** (`defenses`): 1:1 con proyecto, `scheduledDate`, `actualDate`,
  `status`: `PROGRAMADA | REALIZADA | APLAZADA | CANCELADA`.
- **Agenda**: la defensa la **programa el DOCENTE** (quien imparte la asignación del proyecto).
- **Jurados** (`defense_judges`): exactamente 1 de profesor o tutor comunitario
  (`judgeType`: `SUBJECT_PROFESSOR | ACADEMIC_TUTOR | COMMUNITY_TUTOR`):
  - `SUBJECT_PROFESSOR` = el docente que imparte la asignación.
  - `ACADEMIC_TUTOR` = el tutor institucional del proyecto.
  - `COMMUNITY_TUTOR` = el tutor comunitario del proyecto.
  - Los 3 son jurados **obligatorios** del proyecto.
  Restricción: `(professorId IS NOT NULL AND communityTutorId IS NULL) OR viceversa`.
- **Cambios de agenda** (`defense_schedule_changes`): `previousDate`, `newDate`, `changedBy`, `reason`.
- **Evaluaciones** (`defense_evaluations`): `score` decimal(5,2), `comments`, 1 por juez.

---

## 11. Certificación

- **Certificados de culminación** (`completion_certificates`): `pdfUrl` por autor (`authorId` único).

---

## 12. Notificaciones y auditoría

- **Notificaciones** (`notifications`): título, mensaje, `type`, `entityType/Id`, `readAt`.
- **Auditoría** (`activity_logs`): `action`, `entityType/Id`, `description`, `details` (json), `ip`, `userAgent`.

---

## 13. Cambios aplicados al DBML (registro)

1. `pnfs` ← agregado `coordinatorId` (coordinador del PNF).
2. `projects` ← `communityTutorId` obligatorio (1 solo tutor comunitario; eliminada `project_community_tutors`).
3. `project_academic_tutors` ← Note con regla profesor-imparte ≠ tutor.
4. `project_subject_assignments` ← Note aclarando que `professorId` es quien imparte.
5. `project_files.documentType` ← acotado a `RESUMEN | TOMO`.
6. **Nuevas tablas**: `project_corrections`, `tags`, `project_tags`.
7. Roles sembrados: `COORDINADOR`, `DOCENTE`, `ALUMNO`.

## 14. Registro de usuarios y asignación de coordinador (a definir)

Hoy el modelo no cubre **cómo nace un usuario** ni **cómo se asigna el coordinador**.
Propongo 3 enfoques; eliges uno para implementar:

- **Opción A — Provisionamiento por admin institucional (recomendada)**:
  un rol `ADMIN` (o el propio coordinador) da de alta usuarios (profesores, alumnos,
  coordinadores) con datos mínimos; el usuario recibe credenciales temporales / email verify.
  Coordinador se asigna al crear/editar el `pnf` (`coordinatorId`).
  + Controlado, sin ruido. − Requiere operador humano.
- **Opción B — Self-registro con aprobación**:
  cualquiera se registra (email/dni), queda `isActive=false` hasta que un coordinador/admin
  lo aprueba y le asigna rol + perfil (profesor/alumno) + PNF/trayectoria.
  + Escala. −Superficie de spam; necesita bandeja de aprobación.
- **Opción C — Importación masiva**:
  carga CSV de estudiantes/profesores por institución/PNF; el coordinador se marca en el mismo CSV.
  + Rápido para cohortes grandes. − Requiere validación de formato.

Mi recomendación: **A para producción inicial + C para el semillero de alumnos**.

## 15. Pendientes

- **Pendiente P1**: definir quién crea/edita `tags` (grupo / coordinador-docente / libre).
- **Pendiente P2**: implementar validación en backend de la regla profesor-imparte ≠ tutor.
- **Pendiente P3**: validar el DBML con `dbml2sql` dentro del contenedor Docker
  (el host no tiene el CLI instalado).
- **Pendiente P4**: definir mecanismo de registro de usuarios y asignación de coordinador
  (sección 14).
