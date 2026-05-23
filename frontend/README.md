# 🚀 SGP - Sistema de Gestión de Proyectos (Frontend)

Este es el repositorio del Frontend para el **SGP (Sistema de Gestión de Proyectos)** de la Coordinación de Informática de la **UPTT "Mario Briceño Iragorry"** (Núcleo Boconó). La aplicación está construida sobre una arquitectura moderna, escalable y optimizada para el rendimiento en entornos locales de desarrollo mediante Docker.

---

## 🛠️ Stack Tecnológico

El proyecto está construido utilizando las herramientas más eficientes del ecosistema de React:

- **Core:** React 19 + TypeScript + Vite
- **Diseño y UI:** HeroUI (antiguo NextUI) + Tailwind CSS + Lucide React (Íconos)
- **Enrutamiento:** React Router Dom v6+ (Data Router API)
- **Gestión de Estado Global:** Zustand (con persistencia en LocalStorage)
- **Estado del Servidor y Caché:** TanStack Query (React Query v5)
- **Formularios y Validación:** React Hook Form + Zod (Esquemas estrictos)
- **Cliente HTTP:** Axios (con interceptores para manejo de tokens JWT)
- **Utilidades:** Sonner (Notificaciones), Recharts (Gráficos), React Dropzone (Carga de PDFs), Date-fns (Fechas)

---

## 🏛️ Arquitectura del Software: Folder-by-Feature

Para garantizar la mantenibilidad a largo plazo del SGP, el proyecto implementa una arquitectura orientada a **Características (Folder-by-Feature)**. En lugar de agrupar los archivos por su tipo técnico (`components`, `views`, `hooks`), el código se organiza en base a los requerimientos funcionales del negocio.

### Estructura de Directorios (`src/`)

```text
src/
├── config/               # Configuraciones globales (Axios, variables de entorno, constantes)
├── layouts/              # Layouts base contenedores (AdminLayout, AuthLayout, PublicLayout)
├── routes/               # Enrutamiento centralizado (createBrowserRouter)
├── shared/               # El núcleo compartido por toda la aplicación
│   ├── assets/           # Logos institucionales, imágenes globales de la UI
│   ├── components/       # Componentes genéricos de UI (Modales base, botones comunes, wrappers)
│   ├── hooks/            # Custom hooks globales reutilizables (useDebounce, useTheme)
│   ├── store/            # Almacenes globales de Zustand (authStore, uiStore)
│   └── utils/            # Funciones puras de utilidad (formateadores, manejadores de excels)
└── features/             # ◄ EL CORAZÓN DE LA APLICACIÓN (Módulos por características)
    ├── auth/             # Módulo de Autenticación (Login, recuperación)
    ├── projects/         # Módulo de Proyectos Socio-Integradores (Tomos, asignaciones)
    ├── users/            # Módulo de Usuarios (Estudiantes, Tutores, Coordinadores)
    └── reports/          # Módulo de Reportes y Estadísticas del PNF
```

Anatomía de una Característica (features/\*)
Cada directorio dentro de features/ debe ser tratado como un micro-proyecto autocontenido. Un módulo estándar debe replicar la siguiente estructura interna:

```text
features/nombre-feature/
├── assets/                 # Ilustraciones o imágenes exclusivas de esta característica
├── components/             # Componentes exclusivos (Ej: ProjectCard, TomoUploader)
├── hooks/                  # Queries y Mutations de TanStack Query para comunicación con NestJS
├── services/               # Peticiones HTTP directas (Axios) exclusivas del módulo
├── schemas/                # Esquemas de validación de Zod para formularios locales
├── views/                  # Pantallas completas mapeadas directamente en las rutas
└── index.ts                # ◄ El Portero (Public API del módulo)
```

### 🚨 Regla de Oro (Encapsulamiento):

Cada característica debe poseer un archivo index.ts en su raíz. Ningún archivo externo al módulo puede importar subcarpetas internas directamente; todo componente o vista requerido por las rutas o por otra feature debe ser expuesto explícitamente en este index.ts.

📂 Manejo de Assets (Imágenes y Recursos)
src/shared/assets/ o src/features/\*/assets/: Se utiliza para imágenes de la interfaz, logotipos de la universidad o recursos gráficos que forman parte del flujo de renderizado de React. Deben ser importados explícitamente mediante código (import logo from './assets/logo.png') para permitir que Vite aplique optimización de compresión y Cache-Busting en producción.

public/: Reservado estrictamente para recursos estáticos puros que no requieren procesamiento (el favicon.ico, el robots.txt o documentos .pdf/.docx descargables que sirvan como plantillas para los estudiantes). Se referencian mediante rutas absolutas directas (/docs/plantilla.pdf).

⚡ Desarrollo con Docker Compose
El entorno de desarrollo frontend corre de manera aislada dentro de un contenedor Docker para mantener la paridad absoluta del ecosistema de ejecución.

Comandos Esenciales

- **Levantar el entorno en segundo plano:**

```bash
    docker compose up -d
```

- **Monitorear los logs en tiempo real:**

```bash
    docker compose logs -f sgp_frontend_dev
```

- **Apagar los contenedores preservando la caché de dependencias:**

```bash
    docker compose down
```

- **Instalar una nueva librería de manera correcta:**
  Para evitar conflictos con los permisos de volúmenes persistentes y mutaciones del `package-lock.json`, instala las dependencias directamente a través del contenedor ejecutando:

```bash
    docker compose exec sgp_frontend_dev npm i <nombre-paquete>
    # Si es una dependencia de desarrollo:
    docker compose exec sgp_frontend_dev npm i -D <nombre-paquete>
```

- Posteriormente, aplica un reinicio rápido al servicio para que tome los cambios instantáneamente:

```bash
    docker compose restart sgp_frontend_dev
```

---

## 📝 Convenciones de Código

1.  **Componentes:** Escritos en formato functional components con TypeScript (`.tsx`). Se prioriza el uso de propiedades nativas de HeroUI para el diseño atómico.
2.  **Validación de Formularios:** Todo formulario debe poseer un esquema de Zod asociado en la carpeta `schemas/` de su respectiva característica, el cual se inyectará en React Hook Form mediante `@hookform/resolvers/zod`.
3.  **Estado:** Las peticiones de datos de servidor no se almacenan en Zustand; se gestionan exclusivamente a través del sistema de caché de TanStack Query mediante custom hooks. Zustand queda delegado únicamente para datos volátiles locales (sesión del usuario, estado de la barra lateral, etc.).
