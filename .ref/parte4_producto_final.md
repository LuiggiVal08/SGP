PARTE IV
PRODUCTO FINAL

Esta parte expone el resultado de la ejecución del proyecto, detallando el desarrollo de la aplicación web SGP bajo la metodología XP. Cada fase del ciclo de vida XP se evidencia con las Historias de Usuario (docs/SPEC.md) implementadas y las funcionalidades operativas del repositorio.

Fase de Planificación (XP):
Se planteó la propuesta de Proyecto III a la Msc. Carisna Camacho (Encargada de Coordinación de Informática), entregando la Carta de Postulación y aceptación formal. Se solicitó la información institucional (Misión, Visión, flujos de trabajo) y se aplicó la entrevista para levantar los requerimientos iniciales: control de tomos, registro de proyectos, asignaciones y seguimiento histórico.

Fase de Diseño (XP):
Se redactó el banco inicial de Historias de Usuario (28 historias en 10 épicas A–J) y se diseñó la arquitectura limpia en monorepo (backend vertical-slice `src/modules/*`, frontend folder-by-feature `src/features/*`) y el modelo Entidad-Relación (docs/dbml/sgp.dbml: 52 tablas, incluyendo projects, project_files, project_milestones, defensa, tutores y auditoría).

Fase de Codificación e Iteraciones (XP):
- Entorno aislado con Docker (docker compose: sgp_nginx, sgp_frontend_dev, sgp_api_backend, sgp_mysql, sgp_redis).
- Épica A (Auth & RBAC): Login JWT (A1), Recuperación por preguntas de seguridad (A2), Gestión de roles (A3).
- Épicas B–C (Catálogos y actores): instituciones, periodos, PNFs, trayectorias, perfiles de profesor y estudiante.
- Épicas D–E (Proyectos y Comunidad): asignación docente, registro de proyecto con tutor comunitario obligatorio, autores, lugares y tutores comunitarios.
- Épica G (Seguimiento): subida versionada de TOMO/RESUMEN, hitos (trimestres/defensa), correcciones sobre TOMO.
- Épica F (Buscador de antecedentes): exploración de resúmenes por tags acotados al PNF.
- Épica H–I (Defensa, evaluación y certificación): agenda de defensa, jurados, evaluaciones y certificado PDF.
- Épica J (Notificaciones y auditoría): bitácora activity_logs para trazabilidad.
Se presentó el primer avance gráfico (pantallas del prototipo) a la encargada y se recibió asesoría de tutor académico en dos ocasiones para validación metodológica y control de calidad.

Fase de Pruebas (XP):
Ejecución de pruebas automatizadas de aceptación: Jest en backend (10 suites, 33 tests) y Vitest en frontend (9 suites, 38 tests), con lint estricto (tseslint type-checked) y refinamiento estético de interfaces según feedback del cliente.

Fase de Lanzamiento (XP):
Despliegue controlado en la infraestructura física de la Coordinación (entorno productivo local con Docker, MySQL 8.4, Nginx, Redis). Entrega formal de manuales de usuario y capacitación técnica al personal administrativo para el manejo del SGP, cumpliendo el propósito de optimizar el control, registro y recuperación de documentos y proyectos.

Evidencias del Producto Final (SGP):
- Autenticación y roles: endpoints `/auth/login`, `/auth/refresh`, `/auth/logout`, `/users/me`; guard JwtAuthGuard + RBAC.
- Gestión académica: CRUD de instituciones, PNFs, profesores y estudiantes.
- Ciclo de proyecto: `POST/GET/PATCH/DELETE /projects`, `POST /:id/files` (TOMO/RESUMEN, límite 50 MB), `GET /projects/stats` (totales por estado y año), hitos y defensa con jurados.
- Buscador de antecedentes por tags (category: TECNOLOGIA | TEMA | TUTOR | METODOLOGIA).
- Auditoría: `@LogActivity` en controladores registrando action, entityType/Id, details, ip, userAgent.
- Stack: React 19 + Vite 8 + HeroUI (frontend); NestJS 11 + Sequelize + MySQL 8.4 (backend); Redis 7 (caché); Nginx (proxy); Docker (runtime).
