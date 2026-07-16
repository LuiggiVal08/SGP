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
- [ ] **C1** Perfil de profesor — `PENDIENTE`
- [~] **C2** Perfil de estudiante — `EN_REVISION` (ciclo de prueba del loop: +/loop/health)

### Épica D — Asignaciones, proyectos y tutores
- [ ] **D1** Asignación docente a materia — `PENDIENTE`
- [ ] **D2** Registro de proyecto — `PENDIENTE` (communityTutorId obligatorio)
- [ ] **D3** Tutores académicos (regla imparte≠tutor) — `PENDIENTE` ⚠️ regla dura
- [ ] **D4** Autores del proyecto — `PENDIENTE`

### Épica E — Comunidad y tutores comunitarios
- [x] **E1** Lugares comunitarios — `HECHO` (community-places módulo)
- [x] **E2** Tutores comunitarios — `HECHO` (community-tutors módulo)

### Épica F — Buscador de resúmenes (antecedentes)
- [x] **F1** Explorar resúmenes por tags (PNF propio) — `HECHO` (tags módulo; búsqueda pendiente en G1)
- [x] **F2** Etiquetado de proyectos — `HECHO` (tags + project_tags módulo; creación libre)

### Épica G — Seguimiento: hitos, archivos, correcciones
- [ ] **G1** Subir RESUMEN y TOMO — `PENDIENTE`
- [ ] **G2** Hitos del proyecto — `PENDIENTE`
- [ ] **G3** Correcciones sobre el TOMO — `PENDIENTE` ⚠️ flujo correcciones

### Épica H — Defensa y evaluación
- [ ] **H1** Agendar defensa — `PENDIENTE`
- [ ] **H2** Jurados y evaluación — `PENDIENTE`

### Épica I — Certificación
- [ ] **I1** Certificado de culminación — `PENDIENTE`

### Épica J — Notificaciones y auditoría
- [ ] **J1** Notificaciones — `PENDIENTE`
- [ ] **J2** Auditoría — `PENDIENTE`

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
