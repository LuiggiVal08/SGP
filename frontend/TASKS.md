# Frontend — Plan de mejora UI/UX

## 🟢 Fase 1 — Quick Wins (esfuerzo bajo, impacto alto)

- [x] **Skeleton** — Reemplazar textos "Cargando..." con `<Skeleton>` de HeroUI en todas las pages
- [x] **Spinner en botones** — Agregar `<Spinner>` en botones de submit mientras procesan (LoginForm, CreateProjectForm, ForgotPasswordPage, modals admin)
- [x] **Link "¿Olvidaste tu contraseña?"** — Agregar en LoginForm → `/forgot-password`
- [x] **Tooltip en iconos** — Envolver iconos sin texto en `<Tooltip>` (theme switcher, acciones de tabla)
- [x] **Spinner en carga de datos** — Reemplazar SVG spinners custom con `<Spinner>` de HeroUI

## 🟡 Fase 2 — Consistencia Visual (esfuerzo medio)

- [x] **Select HeroUI** — Reemplazar todos los `<select>` nativos:
  - [x] CreateProjectForm (careerId)
  - [x] AdminUsersPage (role filter, user form role/career/institution)
  - [x] AdminUserRegisterPage (role, career, institution)
  - [x] SecurityQuestionsForm (question select)
  - [x] FileUploadSection (file type)
- [x] **Modal de confirmación** — Reemplazar `window.confirm()` con Modal HeroUI en:
  - [x] AdminInstitutionsPage (delete)
  - [x] AdminCareersPage (delete)
  - [x] ProjectDetailPage (delete project)
- [x] **Toast de éxito** — Agregar notificaciones toast post-acción en:
  - [x] CreateProjectForm (proyecto creado)
  - [x] Admin modals (institución/carrera/usuario creado/editado/eliminado)
  - [x] ProfilePage (perfil actualizado, contraseña cambiada)
  - [x] FileUploadSection (archivo subido)
  - [x] SecurityQuestionsForm (preguntas de seguridad guardadas)
  - [x] ChangePasswordForm (contraseña actualizada)
- [x] **Alert en Dashboard** — Reemplazar el banner descartable custom con `<Alert>` de HeroUI

## 🔴 Fase 3 — Feature UX (esfuerzo alto)

- [x] **Autocomplete para tutor/author** — Reemplazar chip grid en CreateProjectForm con `<Autocomplete>`
- [ ] ~~Tabs en Admin~~ — Cancelado por usuario
- [x] **Switch para Active/Inactive** — Usar `<Switch>` en AdminUsersPage para toggle de estado
- [x] **Badge en sidebar** — Agregar `<Badge>` para contadores contextuales

## ⚪ Fase 4 — Mejoras de Calidad

- [x] **NumberField para año** — Reemplazar input numérico de año con `<NumberField>` en CreateProjectForm
- [x] **Popover de ayuda** — Agregar `<Popover>` con ayuda contextual en campos complejos (año, autores, tutor)
- [x] **Resolved names en ProfilePage** — Mostrar nombre de carrera/institución en vez de UUID

## ⚪ Fase 5 — Arquitectura

- [x] **Validación Zod en admin modals** — Migrar `useState` + checks manuales a RHF + Zod (AdminUsersPage)
- [x] **Paginación server-side en AdminUsersPage** — En vez de fetch all + slice local
- [x] **404 page** — Ruta personalizada en vez de redirect a `/`
- [x] **Page titles** — Hook `usePageTitle` para título dinámico
- [x] **Error boundaries** — ErrorBoundary global envolviendo rutas principales

## 🛠️ Fixes Adicionales (audit-driven)

- [x] **aria-label en Selects** — Todos los `Select.Root` sin label visible ahora tienen `aria-label`
- [x] **htmlFor/id en formularios** — Labels asociadas a inputs en ChangePasswordForm, AdminUsersPage modal
- [x] **Tablas scroll horizontal** — Wrapped con `overflow-x-auto` en ProjectsTable
- [x] **DashboardPage loading/error** — Skeletons en stats cards + error state
- [x] **ProjectsTable loading** — Skeletons mientras carga
- [x] **ProfilePage loading/error** — Skeleton cards + error page con retry
- [x] **ChangePasswordForm spinner** — Spinner durante submit
- [x] **Delete modal close bug** — Cierra solo después de que mutación completa (onSuccess/onError)
- [x] **FileUploadSection keys** — Reemplazado array index por uid único
- [x] **ProtectedRoute blank screen** — Redirect a /login en vez de null
- [x] **Security banner flash** — `showBanner` considera `questionsLoading` para evitar parpadeo
- [x] **staleTime en queries** — Agregado a queries que faltaban (stats, projects, security-questions)
- [x] **RootLayout badge queries** — Optimizado con `enabled: user?.role === 'ADMIN'`
- [x] **Keyboard navigation modals** — `autoFocus` en primer input de modals de creación/edición; `autoFocus` en botón Cancelar de modals de eliminación
- [x] **Tuneo estético general** — Background blobs animados, transiciones mejoradas, shadow CSS vars, hover states más ricos, 404 page mejorada, header gradient mejorado en ProfilePage

## 🔴 Fase 6 — Crítico (seguridad/estabilidad)

- [x] **Activar `strict: true` en tsconfig** — Agregar `strict: true` a `compilerOptions` y arreglar los errores
- [x] **ProtectedRoute hydration guard** — Esperar a que `hydrate()` se complete antes de decidir redirect
- [x] **ProtectedRoute null render → loading** — Reemplazar `return null` + `useEffect` con loading state
- [x] **ProjectDetailPage error handling en query** — Agregar `isError` + mensaje de error en query inicial
- [x] **SecurityQuestionsForm loading skeleton** — Reemplazar `return null` con skeleton
- [x] **AdminUserRegisterPage loading indicators** — Agregar `<Skeleton>` en selects de carrera/institución

## 🟡 Fase 7 — Accesibilidad

- [x] **Toast container aria-live** — Agregar `role="alert"` / `aria-live="polite"` al contenedor de toasts
- [x] **PageLoader role progressbar** — Agregar `role="progressbar"` y `aria-label`
- [x] **Breadcrumbs home aria-label** — Agregar `aria-label="Inicio"` al link del icono Home
- [x] **LoginPage decorative divs aria-hidden** — Agregar `aria-hidden="true"` a divs animados decorativos
- [x] **ForgotPasswordPage labels htmlFor** — Asociar labels a inputs en step de preguntas
- [x] **AdminUserRegisterPage labels htmlFor** — Asociar labels a todos los inputs
- [x] **SecurityQuestionsForm labels htmlFor** — Asociar labels a selects/inputs
- [x] **ProjectsTable search aria-label** — Agregar `aria-label` al input de búsqueda
- [x] **FileUploadSection remove button aria-label** — Agregar `aria-label` dinámico a botones de quitar archivo

## 🟡 Fase 8 — UX y Code Quality

- [x] **Shared `statusConfig`** — Extraer configuración de estados a archivo compartido
- [x] **Shared `extractApiError` utility** — Función para eliminar casteo repetido de errores
- [x] **Auth store migrar a `persist` middleware** — Eliminar dual source of truth
- [x] **AdminUserRegisterPage migrar a RHF + Zod** — Reemplazar `useState` manual
- [x] **ChangePasswordForm migrar a service** — Usar service en vez de axiosClient directo
- [x] **FileUploadSection: uidCounter → useRef/crypto** — Contador robusto
- [x] **FileUploadSection: upload secuencial** — Evitar saturar server con uploads simultáneos
- [x] **FileUploadSection: indicador por archivo** — Estado de carga/éxito/error individual
- [x] **toast.store: max limit** — Limitar a 7 toasts máximo
- [x] **theme.store: cleanup event listener** — Remover addEventListener en cleanup
- [x] **ProjectDetailPage: toast antes de navigate** — Asegurar que toast se vea antes de navegar
- [x] **ForgotPasswordPage: botón Atrás** — Navegación hacia atrás entre pasos
- [x] **Breadcrumbs: UUIDs → labels** — Mostrar label legible en vez de UUID en rutas dinámicas
- [x] **SessionTimer: warning de expiración** — Toast 2 min antes de expirar sesión

## 🟢 Fase 9 — Performance / Build

- [x] **Lazy loading de rutas** — `React.lazy()` + `<Suspense>` para reducir bundle inicial
- [x] **manualChunks en Vite** — Separar vendor chunks (react, heroui, recharts)
- [x] **Quitar dependencias no usadas** — react-pdf, pdfjs-dist, @types/react-pdf, @types/recharts
- [x] **Quitar React Compiler Babel** — Remover @rolldown/plugin-babel si no se usa
- [x] **Axios timeout** — Agregar `timeout: 30000` a axios.create()
- [x] **Axios AbortSignal** — Conectar signal de React Query con axios
- [x] **ReactQueryDevtools** — Agregar en desarrollo
- [x] **env.ts con Zod + VITE_** — Usar import.meta.env con validación Zod
- [x] **Vite proxy para dev standalone** — server.proxy para desarrollo fuera de Docker
- [x] **NotFoundPage con ErrorBoundary** — Envolver catch-all route con ErrorBoundary
- [x] **usePageTitle cleanup** — Restaurar título base al desmontar

## 🐛 Bugs Resueltos (previo a las fases)

- [x] **500 en /api/projects, /api/projects/stats, /api/users/me/security-questions** — Tabla `user_questions` faltaba en seed
- [x] **PressResponder warning en Dropdown** — Dropdown.Trigger cambiado a `<button>`

---

**Progreso**: ~92 / ~93 tareas completadas
**Última actualización**: 2026-05-31

---

## 🔴 Fase 10 — Quick Wins (esfuerzo bajo, impacto alto)

- [ ] **Stepper visual con líneas de progreso** — El indicador de pasos del create project es círculos numerados básicos; mejorarlo con líneas de progreso entre pasos
- [ ] **Consistencia en extractApiError** — Algunas mutaciones no muestran el error real del servidor; `extractApiError` se usa en ~6 queries pero otras caen en mensajes genéricos
- [ ] **aria-label en paginación** — Botones de página (<, >, números) sin etiquetas accesibles
- [ ] **Empty states con `role="status"`** — Tablas/tarjetas vacías dinámicas sin live-region announcements
- [ ] **Columna `status` en lista de instituciones de admin** — El filtro de estado no se refleja en la tabla (raw data visible pero status ausente en display)

## 🟡 Fase 11 — Esfuerzo medio

- [ ] **Filtros avanzados de proyectos** — Actualmente solo `search` param; agregar carrera, tutor, estado, rango de fechas
- [ ] **Ordenamiento por columna en tablas** — Click en headers para ordenar proyectos, instituciones, carreras
- [ ] **Indicador de fortaleza de contraseña** — Feedback visual en registro/cambio de contraseña
- [ ] **Subida de avatar en perfil** — Reemplazar iniciales con foto subida por el usuario
- [ ] **Vista previa de archivos** — Previsualización PDF/inline en vez de link de descarga directa

## 🔵 Fase 12 — Nuevas Features / Mayor esfuerzo

- [ ] **Activity log / audit trail** — Registrar y mostrar quién hizo qué (proyecto creado, estado cambiado, archivo subido)
- [ ] **Sistema de notificaciones** — Campana in-app para cambios de estado de proyecto, asignaciones de tutor
- [ ] **Notificaciones por email** — Al cambiar estado, asignar tutor
- [ ] **Widgets de dashboard** — Activity feed, tareas pendientes, cambios recientes
- [ ] **Operaciones bulk** — Admin: activar/desactivar masivo; proyectos: cambio de estado masivo
- [ ] **Reportes / exportación** — Lista de proyectos a CSV/PDF

## 🟣 Fase 13 — Evaluación y Defensa

- [ ] **Rúbricas de evaluación** — CRUD de criterios, puntuaciones y feedback del jurado por proyecto
- [ ] **Defensa de tesis** — Agendar fecha, sala y jurado; registrar nota final; generar acta
- [ ] **Flujo de revisión multi-paso** — Estado del proyecto: Tutor → Comité → Aprobación final (hoy solo hay un status plano)
- [ ] **Generación de documentos** — Certificado de registro, acta de defensa, constancia de aprobación (PDF)

## 🟣 Fase 14 — Comunicación y Colaboración

- [ ] **Mensajería interna** — Chat en tiempo real estudiante ↔ tutor dentro del sistema (WebSocket)
- [ ] **Comentarios por proyecto** — Hilo de feedback en cada proyecto (similar a issues)
- [ ] **Calendario académico** — Hitos, fechas límite de entrega, eventos por carrera

## 🟣 Fase 15 — Visibilidad y Reportes

- [ ] **Catálogo público de proyectos** — Listado de proyectos aprobados visible sin autenticación
- [ ] **Página independiente `/projects`** — Lista completa con filtros avanzados separada del dashboard
- [ ] **Dashboard de admin consolidado** — Overview con activity feed, usuarios recientes, proyectos pendientes
- [ ] **Versionado de archivos** — Historial de drafts vs versión final por proyecto

## 🟣 Fase 16 — Seguridad y Permisos

- [ ] **Guards para rol TUTOR/STUDENT** — Hoy solo ADMIN tiene restricciones; tutores deberían ver solo sus proyectos, estudiantes solo los propios
- [ ] **Editar proyecto vía ruta `/projects/:id/edit`** — Hoy se edita solo desde un modal en el detail page
- [ ] **Signed URLs para archivos en MinIO** — URLs de descarga con expiración en vez de acceso público permanente

## 🐳 Fase 17 — Infraestructura

- [x] **MinIO: vista previa de archivos** — Modal con iframe para ver PDFs inline sin salir de la app
- [ ] **MinIO: bucket por entorno** — Separar buckets dev/test/prod para evitar colisiones de archivos
