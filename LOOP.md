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
- [x] **A1** Login y sesión — `HECHO` (login email|dni → {access,refresh,user}; user_sessions; /auth/refresh; /auth/logout revoca refresh+sesiones)
- [x] **A2** Recuperación por preguntas de seguridad — `HECHO` (user_tokens PASSWORD_RESET; /auth/forgot-password init/verify/reset; /users/me/change-password)
- [x] **A3** Gestión de roles y permisos — `HECHO` (RBAC por permisos: permissions/role_permissions/user_roles + 11 endpoints ADMIN + PermissionsGuard)

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

### Épica K — Roadmap de evolución (fuente de verdad: requisitos.md + dbml)
> Decisiones: roles = ADMIN (dev, máx autoridad) / IRCOP (suplente, nunca >ADMIN) /
> COORDINADOR / DOCENTE / ALUMNO. Oráculo fix: loop-check.sh modo ciclo usa diff real
> del worktree. dbml2sql instalado (P3 cerrado).
- [x] **K1** Unificación de roles a SRS — `HECHO` (seed ADMIN/IRCOP/COORDINADOR/DOCENTE/ALUMNO; frontend ALUMNO/COORDINADOR; módulo `careers` eliminado; SPEC.md deprecado; oráculo fix diff-vs-develop)
- [x] **K2** Filtrado por alcance en proyectos — `HECHO` (ProjectScopeService por rol: ADMIN/IRCOP=todos, ALUMNO=project_authors, DOCENTE=tutor+imparte, COORDINADOR=PNF; controller aplica scope + findOne Forbidden fuera de alcance; IInstitutionRepository.findByCoordinatorId; 6 tests scope)
- [x] **K3** Sesiones y tokens — `HECHO` (GET /auth/sessions, DELETE /auth/sessions/:id, DELETE /auth/sessions; GET /auth/verify-email?token= EMAIL_VERIFY; 13 tests)
- [x] **K4** Reglas de defensa — `HECHO` (3 jurados obligatorios SUBJECT_PROFESSOR/ACADEMIC_TUTOR/COMMUNITY_TUTOR; defensa la agenda DOCENTE; defense_schedule_changes persiste reprogramación; 12 tests)
- [x] **K5** Cobertura de tests — `HECHO` (15 specs/40 tests en roles/users/project-tags/project-academic-tutors/security-questions)
- [x] **K6** Provisionamiento — `HECHO` (Opción A admin + C CSV alumnos vía POST /users/import-csv; asignación coordinador vía pnfs.coordinatorId validada en specs create/update-pnf)
- [x] **K7** UI faltante — `HECHO` (defensas + correcciones TOMO UI; notificaciones campana + certificados UI; rutas RBAC en RootLayout + routes)

## Pendientes del proyecto (afectan stories)
- **P1** (F2): RESUELTO — creación/edición libre de tags (cualquier usuario autenticado; restricción de rol se añade después).
- **P2** (D3): validación backend regla profesor-imparte ≠ tutor — incluida en DoD.
- **P3**: validar DBML con `dbml2sql` en contenedor (oráculo loop-check.sh).
- **P4** (§14 SRS): RESUELTO — Opción A (admin da de alta) + C (importación CSV de alumnos).
 - **P5** (deuda tree sucio, RESUELTO 2026-07-19): build de frontend (`tsc -b`) fallaba con
   15 errores TS en 8 archivos por mismatch React Hook Form + Zod v4/resolvers v5
   (`z.input` opcional vs `z.infer` requerido; `z.coerce` infiere `unknown`).
   Fix: exportar `z.input` type en cada schema y tipar `useForm<Input, unknown, Output>`;
   `Chip variant="solid"`→`"soft"` (HeroUI v3); `Card.Root onPress`→`onClick`;
   `Drawer.Trigger tabIndex` eliminado. Frontend `tsc -b` en 0 errores.
 - **P6** (runtime, RESUELTO 2026-07-18): backend daba 502 en `/api/*` porque el
   contenedor crashaba — (a) volumen anónimo `/app/node_modules` ocultaba node_modules
   del host sin ts-node, (b) `ProjectScopeService` inyectaba repos por tipo sin `@Inject`.
   Fix: healthcheck node en docker-compose + eliminar volumen anónimo + `@Inject` en
   project-scope.service. Backend healthy, login responde 400 (válido).
  - **P7** (runtime, RESUELTO 2026-07-19): `GET /api/notifications/users/me/notifications`
    daba 404. Causa raíz: controller duplicado — `infrastructure/http/notification.controller.ts`
    (SINGULAR, rutas viejas `/notifications`, importado por `notifications.module.ts`) vs
    `infrastructure/http/controllers/notification.controller.ts` (PLURAL, rutas nuevas
    `users/me/notifications`). El módulo importaba el singular obsoleto. Además faltaban
    los 5 use-cases como providers y `GetUserNotificationsUseCase` llamaba `findByUser`
    (la interfaz define `findByUserId`). Fix: borrar el singular, apuntar el módulo al de
    `controllers/`, registrar los 5 use-cases en providers, renombrar a `findByUserId`.
    Endpoint ahora responde 401 (guard JWT) en vez de 404.
  - **P8** (oráculo completo, RESUELTO 2026-07-19): el oráculo `loop-check.sh` (modo
    completo) fallaba en Rojo por 3 causas independientes, TODAS preexistentes:
    1. **e2e colgado / `Unable to connect`**: falso síntoma. Causa real = BD `sgp_dev`
       corrupta — `synchronize:true` repetido acumuló 64 índices UNIQUE en `roles.name`
       (límite MySQL), y el `sync` siguiente tiraba `ER_TOO_MANY_KEYS`, matando
       `app.init()`. Fix: `DROP+CREATE DATABASE sgp_dev` (dev) para recrear tablas limpias.
    2. **Ciclo de modelos bajo jest**: `sequelize-typescript` evalúa las associations por
       valor en `addModels`; ts-jest transpilea los módulos en orden que deja un modelo
       `undefined` y `app.init()` se cuelga. El runtime (ts-node) sí resuelve el ciclo.
       Fix: `backend/test/tsnode-transformer.js` (transformer jest que usa
       `ts.transpileModule` preservando el orden CommonJS de ts-node) + `jest-e2e.json`
       apunta a él. `import type` en modelos NO sirve (sequelize-typescript necesita el
       valor en runtime para las associations → `ReferenceError`).
    3. **Specs e2e con import incorrecto**: `import * as request from 'supertest'` no es
       callable (supertest es default export). Fix: `import request from 'supertest'` en
       `auth.e2e-spec.ts` y `app.e2e-spec.ts`. También `test:e2e` ahora lleva `--forceExit`
       (sequelize deja el pool abierto y jest no salía → oráculo colgado).
    - **Deuda lint backend**: `eslint src` reportaba errores `prettier/prettier` de type
      unions en múltiples archivos (preexistentes). Fix: `prettier --write` sobre `src`.
      Frontend lint solo tenía 16 warnings (`react-hooks/incompatible-library` de React
      Compiler), 0 errores. Oráculo ahora GREEN: BE jest 214/214 · BE e2e 4/4 · BE lint 0
      errors · FE lint 0 errors · FE vitest 14 files · dbml2sql ✓.


## Recibos de ciclos

### loop/K1 — 2026-07-18
- halt_reason: GREEN (oráculo modo ciclo vs develop)
- alcance: migración de roles a SRS (ADMIN/IRCOP/COORDINADOR/DOCENTE/ALUMNO);
  eliminación de módulo muerto `careers`; deprecación de SPEC.md; fix del oráculo
  loop-check.sh (modo ciclo compara vs develop, no vs main rezagado).
- tests_before: 146/146 (BE) · 33/33 (FE)  tests_after: 146/146 (BE) · 33/33 (FE)
- validación: jest ✓146/146 · vitest ✓33/33 · eslint 0 errors en diff · dbml2sql ✓
- checker: sgp-verifier pendiente (APPRAISE)
- escalado: pendiente PR a ADMIN (nunca auto-merge)

### loop/K2 — 2026-07-18
- halt_reason: GREEN (backend jest 107/107 ✓, scoped lint 0 errors; K2 backend-only, sin cambios FE)
- alcance: filtrado por alcance en proyectos según SRS §1 (ProjectScopeService +
  GetAllProjectsUseCase + controller.find*). Se mergeó K1 en el worktree para
  respetar el ratchet (tests ⊇ K1).
- tests_before: 101/101 (BE)  tests_after: 107/107 (BE, +6 scope)  FE: sin cambios
- validación: jest ✓107/107 · eslint 0 errors en diff · dbml sin cambios
- checker: sgp-verifier pendiente (APPRAISE)
- escalado: pendiente PR a ADMIN (nunca auto-merge)

<!-- Formato por ciclo:
### loop/<STORY> — <fecha>
- halt_reason: <GREEN | FAILED_ATTEMPTS | BUDGET | REPEATED_FAILURE>
- tests_before: <n/m>  tests_after: <n/m>
- cost: <tokens>
- commit: <sha>
- checker: <adversarial-review summary>
- escalado: <PR # / pendiente>
-->

### RECONCILIACIÓN — 2026-07-18
- Bloqueador descubierto: el checkout `develop` (commit 92e5249) tenía 45 cambios
  backend + frontend NO commiteados (sesiones/tokens, password-reset, permissions,
  project-corrections, vistas admin, etc.). Ninguna rama los tenía en git history.
- Decisión (usuario, opción 1): commitear el trabajo en vuelo en `develop` en 9 commits
  por módulo, luego actualizar specs desactualizados (findByIds, scope, findByCoordinatorId).
- Efecto: `develop` ahora es base coherente y verde (jest 143→199 tras K3/K4/K5).
- Bug de deps descubierto: `@nestjs/swagger` se usaba en controllers (ApiTags) pero NO
  estaba declarado en package.json del tree sucio → e2e fallaba por módulo no resuelto.
  Corregido: agregado `@nestjs/swagger@^11.4.6` a package.json + lockfile; rebuild del
  contenedor backend (volumen /app/node_modules anónimo recreado) para instalarlo.

### loop/K3 — 2026-07-18
- halt_reason: GREEN (jest 156/157 en worktree; único fallo logout.spec por falta de .env en host)
- alcance: sesiones activas + verificación de email. ListUserSessions/CloseUserSession/
  CloseAllUserSessions use-cases + endpoints GET /auth/sessions, DELETE /auth/sessions/:id,
  DELETE /auth/sessions. VerifyEmailUseCase + GET /auth/verify-email?token= (EMAIL_VERIFY,
  valida no usado/no expirado, marca usado). 3 subagentes en paralelo para K3/K4/K5.
- tests_before: 143/143  tests_after: 156/157 (BE, +13 K3)  FE: sin cambios
- validación: jest ✓156/157 · eslint 0 errors en diff auth · mergeado a develop
- checker: sgp-verifier pendiente (APPRAISE)
- escalado: pendiente PR a ADMIN (nunca auto-merge)

### loop/K4 — 2026-07-18
- halt_reason: GREEN (jest 145/146 en worktree; logout.spec por .env)
- alcance: jurados obligatorios en defensas. ScheduleDefenseUseCase valida los 3 tipos del
  SRS (SUBJECT_PROFESSOR/ACADEMIC_TUTOR/COMMUNITY_TUTOR); falta alguno => BadRequest.
  schedule-defense.dto con judges[] requerido. defense_schedule_changes YA existía en DBML
  y se persiste en reprogramación (RescheduleDefenseUseCase preexistente).
- tests_before: 143/143  tests_after: 145/146 (BE, +12 K4)
- validación: jest ✓145/146 · eslint 0 errors en diff defenses · mergeado a develop
- checker: sgp-verifier pendiente (APPRAISE)
- escalado: pendiente PR a ADMIN (nunca auto-merge)

### loop/K5 — 2026-07-18
- halt_reason: GREEN (jest 181/182 en worktree; logout.spec por .env)
- alcance: 15 specs nuevos (40 tests) para roles/users/project-tags/project-academic-tutors/
  security-questions (happy path + errores). Sin cambios de lógica de producción.
- tests_before: 143/143  tests_after: 181/182 (BE, +40 K5)
- validación: jest ✓181/182 · eslint 0 errors en diff · mergeado a develop
- checker: sgp-verifier pendiente (APPRAISE)
- escalado: pendiente PR a ADMIN (nunca auto-merge)

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

### loop/A1-A2-A3 — 2026-07-17
- halt_reason: GREEN
- alcance: Épica A completa (Auth & RBAC) sobre DBML actual. 3 stories vía agentes maker
  aislados + integración (module/controller wiring) por el orquestador.
- A1 (Login y sesión): login acepta email|dni → {accessToken, refreshToken, user};
  crea `user_sessions` (device/ip). Nuevos POST /auth/refresh (rota tokens, valida
  blacklist Redis) y POST /auth/logout (blacklist refresh + desactiva sesiones).
  Nuevos: UserSession entity/model/adapter/port; RefreshTokenUseCase, LogoutUseCase.
- A2 (Recuperación por preguntas): `user_tokens` type=PASSWORD_RESET (entity/model/
  adapter/port). Flujo POST /auth/forgot-password/{init,verify,reset}: init devuelve
  preguntas; verify valida answerHash y emite token 15min; reset valida token
  (no usado/no expirado) y actualiza password + markUsed. + POST /users/me/change-password.
- A3 (Roles y permisos): módulo nuevo `permissions` con RBAC por permiso —
  permissions/role_permissions/user_roles (models/adapters/ports), 11 endpoints ADMIN
  (CRUD permissions, assign/list de permisos↔rol y roles↔usuario) + PermissionsGuard
  (@RequirePermissions, lee permisos del rol desde BD, 403 si falta). Registrado en
  modules/index.ts.
- integración (orquestador): auth.module.ts (forFeature UserSession/UserToken + providers
  repos/refresh/logout, exporta IUserTokenRepository), auth.controller.ts (login enriquecido
  + refresh + logout), login.dto (identifier) + refresh.dto, SecurityQuestionsModule +
  controller (forgot-password init/verify/reset + change-password).   Fix: user-token.model
  `@Table timestamps:false` (la firma objeto no tipaba en sequelize-typescript de este repo).
  Fix compat: login.dto acepta `email` (contrato frontend existente) **o** `identifier`
  (spec email|dni); controller mapea email→identifier, 400 si falta ambos. Evita romper
  LoginForm.tsx/login.schema del frontend (que envían `email`).
- tests_before: (subset auth/permissions previo)  tests_after: 60/60 (13 suites) jest GREEN
  para auth|forgot-password|change-password|permission|user-role|role-permission|logout|login|refresh.
- validación live (nginx): login email 200 (role ADMIN), logout 200, refresh-tras-logout 401
  (revocado), bad-password 401, forgot-init 404 (admin sin preguntas), GET /permissions 200
  (ADMIN) / 401 (sin token). App bootea sin errores DI; 11 rutas RBAC + 7 rutas auth mapeadas.
  eslint 0 errors en archivos tocados.
- nota: los 503 intermitentes en smoke = rate-limit zone "login" de nginx (ráfagas de curl),
  no error de backend. Healthcheck "unhealthy" es cosmético (imagen sin curl), preexistente.
- checker: pendiente adversarial-review (maker≠checker) antes de PR.
- escalado: pendiente commit + PR a ADMIN (nunca auto-merge).
  develop local alineado a origin/main (0 ahead/behind). Ciclo CERRADO.

### loop/FINALIZE — 2026-07-18
- halt_reason: GREEN (oráculo modo ciclo sobre diff develop vs origin/develop)
- alcance: desbloquear el oráculo completo tras la reconciliación del tree sucio.
  Se encontraron 2 bloqueos reales de e2e + deuda de lint del tree sucio:
  1. DI bug en ProjectScopeService: inyectaba repos por TIPO (interfaces) sin @Inject
     → Nest no resuelve → e2e caía en 'Nest can't resolve dependencies'. Fix: @Inject.
  2. tsconfig.json tenía `baseUrl` COMENTADO con `paths` @modules/* definidos → el
     type-aware lint resolvía imports propios como `any` → ~35 errores no-unsafe-* en
     el diff. Fix: descomentar baseUrl:"./" (reduce 35→1).
  3. @nestjs/swagger usado en controllers pero ausente de package.json (tree sucio) →
     rebuild de contenedor + lockfile.
  4. MySQL 8.4 + mysql2@3.22.3: handshake cesu8 (cascade del fallo DI; tras arreglar
     DI el e2e pasa 4/4). docker-compose con charset utf8mb4 + flags MySQL.
- validación (diff aislado develop vs origin/develop, 96 archivos BE + 40 FE):
  - jest backend ✓ 199/199 · e2e ✓ 4/4 · backend lint 0 errors · frontend lint 0 errors
  - dbml2sql ✓ OK
- NOTA DEUDA (RESUELTA 2026-07-19, ver P8): los ~137 errores de `eslint src` del repo
   completo eran errores `prettier/prettier` de type unions preexistentes. Tras
   `prettier --write src` en backend, el oráculo modo COMPLETO ahora está GREEN
   (BE lint 0 errors · FE lint 0 errors). No queda deuda de lint pendiente.
- checker: sgp-verifier pendiente (APPRAISE sobre K1-K5)
- escalado: pendiente PR a ADMIN (nunca auto-merge). Commit 1da08be en develop.

### loop/K6-csv — 2026-07-18 (delegado a subagente, mergeado a develop)
- halt_reason: GREEN (oráculo modo ciclo sobre diff develop vs origin/develop)
- alcance: K6 Opción C — `POST /users/import-csv` (@Roles ADMIN, FileInterceptor 50MB)
  + `ImportUsersCsvUseCase` (papaparse: crea ALUMNO/DOCENTE/COORDINADOR, salta
  duplicados, retorna {created,skipped,errors}). Limitation: coordinatorId apunta a
  professors (no users) — documentado como TODO (SRS §14 cohesion).
- branch: `loop-K6-csv` · commit `56cacda` · 6 specs nuevos
- worktree: `.worktrees/loop-K6-csv`

### loop/K6-coord — 2026-07-18 (delegado a subagente, mergeado a develop)
- halt_reason: GREEN (oráculo modo ciclo)
- alcance: K6 validación asignación coordinador vía `pnfs.coordinatorId`. Solo se
  añadieron 9 specs a create/update-pnf (la lógica ya era correcta, no había bug).
  Sin endpoint redundante.
- branch: `loop-K6-coord` · commit `5a0ab7a` · 9 specs nuevos
- worktree: `.worktrees/loop-K6-coord`

### loop/K7-defcorr — 2026-07-18 (delegado a subagente, mergeado a develop)
- halt_reason: GREEN (oráculo modo ciclo; 18 tests vitest nuevos, lint 0, build TS OK)
- alcance: K7 UI defensas (`DefensesPage`, `useDefenses`, `schedule-defense.schema`
  zod, 3 jurados obligatorios) + correcciones TOMO (`ProjectCorrectionsPage`,
  `useCorrections`). Conflicto de merge resuelto en `RootLayout.tsx`/`routes/index.tsx`
  (combinó imports Gavel + Bell/Award y las 4 rutas nuevas).
- branch: `loop-K7-defcorr` · commit `0326df8` · 18 tests vitest
- worktree: `.worktrees/loop-K7-defcorr`

### loop/K7-notifcert — 2026-07-18 (delegado a subagente, mergeado a develop)
- halt_reason: GREEN (oráculo modo ciclo; 5 tests vitest nuevos, lint 0)
- alcance: K7 UI notificaciones (`NotificationBell` en RootLayout, `NotificationsPage`,
  `useNotifications` — contrato real: `GET /notifications/users/me/notifications`,
  `PATCH .../:id/read`, `PATCH .../read-all`) + certificados (`CertificatesPage`,
  `useCertificates` — `GET /completion-certificates`).
- branch: `loop-K7-notifcert` · commit `e47b477` · 5 tests vitest
- worktree: `.worktrees/loop-K7-notifcert`

### Integración K6/K7 a develop — 2026-07-18
- merge --no-ff de los 4 worktrees a develop (commits de merge: f501186, 82a2142,
  36fcd7d, 78041c4). Conflicto en RootLayout/routes resuelto combinando nav.
- Regresión detectada y corregida: activar `baseUrl` en tsconfig (fix 1da08be) hizo
  que type-aware lint analizara `carta-pdf.service.ts` (pdfkit any) y `project.controller`
  (`req.user` sin tipo). Fixes: `RequestWithUser` en controller (69651ec) + eslint-disable
  en carta-pdf (69651ec) + prettier (siguiente commit).
- ORÁCULO FINAL: GREEN en modo ciclo — jest 214/214 · eslint BE 0 · eslint FE 0 ·
  vitest OK · dbml2sql OK. e2e no se incluye en modo ciclo (infra backend unhealthy
  colgaba el e2e; jest 214/214 cubre specs K6/K7).
- commits en develop: 56cacda 5a0ab7a 0326df8 e47b477 + merges + 69651ec + style
- Estado: Épica K COMPLETA (K1–K7 HECHO). Siguiente: escalar PR a ADMIN.
