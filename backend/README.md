# 🚀 SGP - Sistema de Gestión de Proyectos (Backend)

Este es el repositorio del Backend para el **SGP (Sistema de Gestión de Proyectos)** de la Coordinación de Informática de la **UPTT "Mario Briceño Iragorry"** (Núcleo Boconó). La aplicación está construida sobre una arquitectura modular vertical altamente desacoplada, enfocada en el dominio y optimizada para el rendimiento mediante contenedores Docker.

---

## 🛠️ Stack Tecnológico

El proyecto está estructurado utilizando el ecosistema empresarial más robusto de Node.js:

- **Core Framework:** NestJS v10+ + TypeScript
- **Persistencia y ORM:** Sequelize v6 + `sequelize-typescript`
- **Motor de Base de Datos:** MySQL 8.0
- **Caché y Sesiones:** Redis (vía cliente de alto rendimiento `ioredis`)
- **Validación de Entorno:** Zod (Esquemas estrictos y tipados para variables `.env`)
- **Seguridad y Criptografía:** Bcrypt (Hasheo de credenciales) + Passport.js (Estrategias JWT)

---

## 🏛️ Arquitectura del Software: Modular Vertical (Hexagonal/Ports & Adapters)

Para garantizar la mantenibilidad y el aislamiento total del SGP, el backend implementa una **Arquitectura Modular Vertical** guiada por los principios de la Arquitectura Hexagonal. En lugar de centralizar capas técnicas globales, el sistema se divide en módulos independientes dueños de sus propias reglas de negocio, persistencia e infraestructura.

### Estructura de Directorios (`src/`)

```text
src/
├── config/               # Validación estricta y tipada del entorno global (Zod env config)
├── share/                # El núcleo de infraestructura compartido por toda la aplicación
│   ├── domain/           # Contratos globales del sistema
│   │   └── ports/        # Interfaces genéricas abstractas (Ej: ICacheService.ts)
│   └── infrastructure/   # Implementaciones técnicas reales y reutilizables
│       ├── adapters/     # Adaptadores globales concretos (Ej: redis-cache.adapter.ts)
│       └── modules/      # Envoltorios globales nativos de NestJS (DatabaseModule, RedisModule)
├── modules/              # ◄ EL CORAZÓN DE LA APLICACIÓN (Módulos verticales autocontenidos)
│   ├── auth/             # Módulo de Autenticación (Emisión de tokens, guards JWT)
│   ├── projects/         # Módulo de Proyectos Socio-Integradores (Lógica de tomos y asignaciones)
│   └── users/            # Módulo de Usuarios (Gestión de Estudiantes, Tutores y Coordinadores)
├── app.module.ts         # Orquestador raíz del sistema (Director de orquesta)
└── main.ts               # Punto de entrada de la aplicación HTTP de NestJS
```

### Anatomía de un Módulo Vertical (`modules/*`)

Cada directorio dentro de `modules/` se comporta como un microproyecto autocontenido. **Todos los nombres de campos y tablas en la base de datos se manejan estrictamente en inglés**. Un módulo estándar replica la siguiente estructura interna:

```text
modules/nombre-modulo/
├── domain/               # ◄ CAPA DE DOMINIO (Reglas de negocio puras, código 100% agnóstico)
│   ├── entities/         # Clases puras de TypeScript que modelan el negocio (Ej: User.ts)
│   └── ports/            # Interfaces/Contratos que el dominio exige (Ej: IUserRepository.ts)
├── application/          # ◄ CAPA DE APLICACIÓN (Casos de uso del sistema)
│   └── use-cases/        # Clases que ejecutan acciones de negocio específicas (Ej: CreateUser.ts)
├── infrastructure/       # ◄ CAPA DE INFRAESTRUCTURA (Detalles tecnológicos externos)
│   ├── adapters/         # Implementaciones concretas de los puertos (Ej: user-sequelize.adapter.ts)
│   ├── http/             # Controladores de NestJS, rutas y DTOs de entrada (Zod o Class-Validator)
│   └── persistence/      # Modelos de definición física de tablas de Sequelize (Ej: user.model.ts)
└── nombre-modulo.module.ts # ◄ Definición del módulo nativo de NestJS

```

### 🚨 Regla de Oro (Encapsulamiento y Modularidad Vertical):

> **"Si una carpeta de módulo dentro de `src/modules/` se borra y se quita su importación en el `app.module.ts`, la aplicación debe compilar perfectamente y seguir funcionando en el siguiente segundo."**

Para cumplir con esta regla de oro:

1. **Modelos Locales:** Está estrictamente prohibido usar un archivo global `index.ts` para centralizar esquemas de bases de datos. Los modelos viven en su módulo y se escanean dinámicamente gracias a la configuración `autoLoadModels: true` del `DatabaseModule`.
2. **Inversión de Dependencias (Puertos y Adaptadores):** La lógica de negocio (`application/`) nunca importa un modelo de base de datos o un cliente HTTP directamente. Siempre interactúa mediante los **Puertos (Interfaces)**. Los **Adaptadores** implementan estas interfaces y NestJS se encarga de inyectarlos dinámicamente mediante el contenedor IoC empleando tokens (`@Inject('IUserRepository')`).

---

## ⚡ Desarrollo con Docker Compose

El entorno de desarrollo de la API corre aislado en un contenedor Docker, garantizando un ecosistema de ejecución controlado con reinicios automáticos y recarga en caliente sincrónica.

### Comandos Esenciales

- **Levantar el ecosistema completo en segundo plano:**

```bash
  docker compose up -d

```

- **Monitorear los logs en tiempo real (Backend):**

```bash
  docker compose logs -f sgp_api_backend

```

- **Apagar la infraestructura preservando volúmenes de MySQL y Redis:**

```bash
  docker compose down

```

- **Instalar una nueva librería de manera correcta:**
  Para evitar corrupciones de permisos en los volúmenes compartidos y sincronizar de forma exacta el `package-lock.json`, instala dependencias ejecutando directamente dentro del contenedor:

```bash
  docker compose exec sgp_api_backend npm i <nombre-paquete>
  # Si es una dependencia de desarrollo (Ej: @types/*):
  docker compose exec sgp_api_backend npm i -D <nombre-paquete>

```

- **Aplicar un reinicio forzado al servicio del backend:**

```bash
  docker compose restart sgp_api_backend

```

---

## 📝 Convenciones de Código y Estilo

1. **Path Aliases (Rutas Limpias):** Queda estrictamente prohibido el uso de rutas relativas profundas (`../../../../`). Se debe hacer uso obligatorio de los alias configurados en el `tsconfig.json`:

- `@config/*` -> Rutas hacia `src/config/*`
- `@share/*` -> Rutas hacia `src/share/*`
- `@modules/*` -> Rutas hacia `src/modules/*`

2. **Loggers Uniformes:** No se debe utilizar `console.log` o `console.error` bajo ningún concepto en capas de infraestructura compartida o módulos. Es obligatorio instanciar el log nativo de NestJS (`private readonly logger = new Logger('Contexto')`) para asegurar la uniformidad cromática y estructural de la consola de auditoría de Docker.
3. **Manejo de Errores:** Los controladores no manejan lógica de negocio ni capturan excepciones de base de datos de manera cruda; se delega la ejecución al caso de uso, y los errores de negocio se transforman en excepciones HTTP nativas del framework (`HttpException`, `BadRequestException`, `UnauthorizedException`).
