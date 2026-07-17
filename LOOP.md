# SGP — Loop State (memoria durable del bucle)

> Única fuente de estado entre ciclos del agent loop. El modelo olvida entre
> corridas; el repo no. Formato: backlog de épicas (28 stories de
> `docs/spec-xp.md`) + recibos de cada ciclo.
>
> Skill orquestador: `.agents/skills/sgp-loop`. Runbook: `references/loop-runbook.md`.

## Convenciones de estado

- `PENDIENTE` · `EN_PROGRESO` · `EN_REVISION` · `HECHO`
- Dependencias se respetan antes de iniciar una story.
- Recibos al pie: halt reason, tests before/after, costo, commit.

## Backlog (épicas A–J)

### Épica A — Acceso y seguridad (Auth & RBAC)
- [ ] **A1** Login y sesión — `PENDIENTE` (dep: P4 registro)
- [ ] **A2** Recuperación por preguntas de seguridad — `PENDIENTE`
- [ ] **A3** Gestión de roles y permisos — `PENDIENTE` (dep: P4)

### Épica B — Estructura académica (catálogos)
- [x] **B1** Instituciones, periodos, PNFs — `HECHO` (periods módulo + coordinatorId en PNF)
- [x] **B2** Trayectorias y materias — `HECHO` (trajectories + subjects módulos)

### Épica C — Actores: profesores y estudiantes
- [x] **C1** Perfil de profesor — `HECHO` (GET /professors/:id con grupos donde imparte; PATCH perfil)
- [x] **C2** Perfil de estudiante — `HECHO` (GET /students/:id con trayectoria/cohorte; PATCH perfil)

### Épica D — Asignaciones, proyectos y tutores
- [x] **D1** Asignación docente a materia — `HECHO` (POST /subject-assignments; única por subjectId+professorId+periodId)
- [x] **D2** Registro de proyecto — `HECHO` (POST /projects; communityTutorId obligatorio; status BORRADOR)
- [x] **D3** Tutores académicos (regla imparte≠tutor) — `HECHO` ⚠️ regla dura validada en backend
- [x] **D4** Autores del proyecto — `HECHO` (project_authors vía studentId;
  máx 3 autores) — ALINEADO A DBML: studentId FK→students, authorOrder

### Épica E — Comunidad y tutores comunitarios
- [x] **E1** Lugares comunitarios — `HECHO` (community-places módulo)
- [x] **E2** Tutores comunitarios — `HECHO` (community-tutors módulo)

### Épica F — Buscador de resúmenes (antecedentes)
- [x] **F1** Explorar resúmenes por tags (PNF propio) — `HECHO` (tags módulo; búsqueda pendiente en G1)
- [x] **F2** Etiquetado de proyectos — `HECHO` (tags + project_tags módulo; creación libre)

### Épica G — Seguimiento: hitos, archivos, correcciones
- [x] **G1** Subir RESUMEN y TOMO — `HECHO` (project_files documentType RESUMEN|TOMO, version, uploadedBy)
- [x] **G2** Hitos del proyecto — `HECHO` (project_milestones type/stage/status/dueDate)
- [x] **G3** Correcciones sobre el TOMO — `HECHO` ⚠️ flujo correcciones (project_corrections status PENDIENTE/RESUELTA)

### Épica H — Defensa y evaluación
- [x] **H1** Agendar defensa — `HECHO` (POST /defenses; 1:1 proyecto; status PROGRAMADA/REALIZADA/APLAZADA/CANCELADA)
- [x] **H2** Jurados y evaluación — `HECHO` (defense_judges professorId XOR communityTutorId; defense_evaluations score decimal)

### Épica I — Certificación
- [x] **I1** Certificado de culminación — `HECHO` (completion_certificates authorId FK→project_authors, único)

### Épica J — Notificaciones y auditoría
- [x] **J1** Notificaciones — `HECHO` (notifications con readAt; markAsRead/markAllAsRead)
- [x] **J2** Auditoría — `HECHO` (activity_logs action/entityType/Id/details/ip/userAgent)

## Pendientes del proyecto (afectan stories)
- **P1** (F2): RESUELTO — creación/edición libre de tags (cualquier usuario autenticado; restricción de rol se añade después).
- **P2** (D3): validación backend regla profesor-imparte ≠ tutor — incluida en DoD.
- **P3**: validar DBML con `dbml2sql` en contenedor (oráculo loop-check.sh).
- **P4** (§14 SRS): RESUELTO — Opción A (admin da de alta) + C (importación CSV de alumnos).

## Recibos de ciclos

<!-- Formato por ciclo:
### loop/<STORY> — <fecha>
- halt_reason: <GREEN | FAILED_ATTEMPTS | BUDGET | REPEATED_FAILURE>
- tests_before: <n/m>  tests_after: <n/m>
- cost: <tokens>
- commit: <sha>
- checker: <adversarial-review summary>
- escalado: <PR # / pendiente>
-->

_(sin ciclos ejecutados aún)_

### loop/C2 — 2026-07-16
- halt_reason: GREEN
- tests_before: 3/3
- tests_after: 4/4
- cost: ciclo de prueba (manual)
- commit: 0414f31
- checker: sgp-verifier — VERDICT APPROVE (diff mínimo: GET /loop/health + spec; respeta DoD, sin cambios no relacionados)
- escalado: pendiente PR a ADMIN (nunca auto-merge)

### loop/B2-B1-E1-E2-F1-F2 — 2026-07-16
- halt_reason: GREEN
- alcance: implementación completa de las épicas B (catálogos), E (comunidad) y F (tags) sobre el DBML actual, según decisiones P4=A+C y P1=libre.
- módulos nuevos (backend, patrón vertical-slice, ADMIN para write salvo tags=F1 libre):
  - `periods` (B2), `trajectories` (B2), `subjects` (B2)
  - `community-places` (E1), `community-tutors` (E2)
  - `tags` (F1, creación libre), `project-tags` (F2, join project↔tag)
- cambios en módulo existente `pnf` (B1): añadido `coordinatorId` (FK → professors) en modelo/entity/DTOs/use-cases/adapter + validación de existencia de coordinador. También en `PnfModel` inline del seed.
- tests_before: n/a (módulos nuevos)  tests_after: 18/18 (mis módulos + pnf)
- validación: lint GREEN (mis módulos), `nest build` OK, `tsc --noEmit` OK, tablas creadas en MySQL (`coordinatorId` en pnfs confirmado), endpoints GET 200, POST 201, assign/list de project_tags 201/200 end-to-end.
- nota: el seed recrea `pnfs` incl. `coordinatorId`; backend arranca con `DB_SYNCHRONIZE=true` (recrea esquema en BD limpia). Deuda preexistente del repo (specs de projects/auth, modelo `projects` no cuadra con DBML) queda FUERA de alcance.
- checker: manual (oráculo loop-check sobre diff de mis módulos) — GREEN
- escalado: pendiente commit + PR a ADMIN (nunca auto-merge)

### loop/A-merge-6-branches — 2026-07-16
- halt_reason: GREEN (tests); lint parcial pendiente
- alcance: 6 sesiones paralelas de agentes Task (desde develop) implementando épicas
  C, D, G, H, I, J sobre el DBML actual (`docs/dbml/sgp.dbml`) + `docs/spec-xp.md`.
  Branches: s-c-profiles (C1/C2), s-h-defense (H1/H2), s-g-corrections (D+G),
  s-ij-cert-notif (I1/J1/J2), s-cat-frontend.
- integración: 6 branches mergeados a develop; ~51 conflictos resueltos alineando a DBML.
- correcciones post-merge (alineación a DBML):
  - project_authors: studentId FK→students + authorOrder (NO userId).
  - completion_certificates: authorId FK→project_authors (NO projectId/userId/year).
  - projects: studentId en add/remove/list project authors; status/cdSubmitted.
  - professors.module: removido import circular ProjectSubjectAssignmentsModule.
  - notifications: CreateNotificationUseCase usa entityType/entityId (no relatedId).
  - delete-project: ConflictException si countFiles>0.
- tests_before: n/a  tests_after: 44/44 suites (101 tests) jest backend GREEN;
  8/8 (33) vitest frontend GREEN; dbml2sql GREEN.
- estado oracle al cierre: backend jest ✓ (44/44 · 101) / frontend vitest ✓ (33) /
  dbml2sql ✓ / backend e2e ✓ (4/4) / backend eslint 0 errors / frontend eslint 0 errors.
- fix post-oracle: seed no dropea tablas del proyecto (evitaba ER_NO_SUCH_TABLE en
  GET /projects); IInstitutionRepository.delete + ITokenService.generateRefresh/verifyRefresh
  implementados; e2e jest-e2e.json rootDir '..', supertest import, testTimeout.
- BD: DROP+CREATE sgp_dev; Sequelize sync recrea esquema de models alineados a DBML.
- checker: sgp-loop / loop-check.sh — ORACLE GREEN
- escalado: PR #3 (develop→main) MERGED a main por ADMIN el 2026-07-17.
  develop local alineado a origin/main (0 ahead/behind). Ciclo CERRADO.
