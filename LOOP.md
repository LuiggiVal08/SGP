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
- [ ] **B1** Instituciones, periodos, PNFs — `PENDIENTE`
- [ ] **B2** Trayectorias y materias — `PENDIENTE`

### Épica C — Actores: profesores y estudiantes
- [ ] **C1** Perfil de profesor — `PENDIENTE`
- [ ] **C2** Perfil de estudiante — `PENDIENTE`

### Épica D — Asignaciones, proyectos y tutores
- [ ] **D1** Asignación docente a materia — `PENDIENTE`
- [ ] **D2** Registro de proyecto — `PENDIENTE` (communityTutorId obligatorio)
- [ ] **D3** Tutores académicos (regla imparte≠tutor) — `PENDIENTE` ⚠️ regla dura
- [ ] **D4** Autores del proyecto — `PENDIENTE`

### Épica E — Comunidad y tutores comunitarios
- [ ] **E1** Lugares comunitarios — `PENDIENTE`
- [ ] **E2** Tutores comunitarios — `PENDIENTE`

### Épica F — Buscador de resúmenes (antecedentes)
- [ ] **F1** Explorar resúmenes por tags (PNF propio) — `PENDIENTE`
- [ ] **F2** Etiquetado de proyectos — `PENDIENTE` (P1: quién crea tags)

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
- **P1** (F2): definir quién crea/edita tags.
- **P2** (D3): validación backend regla profesor-imparte ≠ tutor — incluida en DoD.
- **P3**: validar DBML con `dbml2sql` en contenedor (oráculo loop-check.sh).
- **P4** (§14 SRS): mecanismo de registro de usuarios + asignación de coordinador
  (Opción A admin + C CSV). Necesario antes de A1/A3.

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
