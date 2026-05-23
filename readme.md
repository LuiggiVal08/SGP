# 🚀 SGP: Sistema de Gestión de Proyectos (Monorepo Local)

Este repositorio centraliza la infraestructura de desarrollo para el **SGP (Sistema de Gestión de Proyectos)** de la Coordinación de Informática de la **UPTT "Mario Briceño Iragorry"**. El sistema está completamente contenedorizado y estructurado mediante una **Arquitectura Modular Vertical**, diseñada para escalar desde un entorno de desarrollo local hasta despliegues productivos.

---

## 🛠️ Stack Tecnológico

El proyecto se sustenta en tecnologías de alto rendimiento y tipado estricto:

- **Frontend:** React 19 + TypeScript + Vite + HeroUI + Tailwind CSS.
- **Backend:** NestJS + TypeScript, estructurado bajo **Arquitectura Modular Vertical** (Hexagonal/Ports & Adapters).
- **Base de Datos:** MySQL 8.4 (con esquemas aislados para Desarrollo y Pruebas).
- **ORM:** Sequelize + `sequelize-typescript` para modelos de datos tipados.
- **Mensajería:** Redis + BullMQ para procesamiento de tareas en segundo plano.

---

## 🏛️ Arquitectura e Infraestructura (Docker)

El proyecto utiliza una red de Docker (`Docker Network`) que orquesta el ciclo de vida de los servicios mediante `docker-compose.yml`:

### Componentes del Sistema

1. **`sgp_nginx` (Puerto 80):** Proxy inverso central. Gestiona el enrutamiento:
    - `/api` → `sgp_api_backend`
    - `/` → `sgp_frontend_dev`
2. **`sgp_frontend_dev` (Puerto Interno 5173):** Entorno de desarrollo para React con hot-reload optimizado.
3. **`sgp_api_backend` (Puerto Interno 3000):** API NestJS. Implementa **Modularidad Vertical** con separación estricta entre dominio, aplicación e infraestructura.
4. **`sgp_mysql` (Puerto 3306 expuesto):** Instancia de base de datos relacional para el almacenamiento persistente.
5. **`sgp_redis`:** Gestión de colas, caché y estado de sesiones.

### 🔒 Reglas de Conectividad y Encapsulamiento

- **Aislamiento de Capas:** El Frontend nunca se conecta directamente a la base de datos o a Redis. Toda interacción ocurre exclusivamente a través de los endpoints expuestos por la API de NestJS.
- **Modularidad Vertical:** Cada módulo funcional (`users`, `projects`, `auth`) dentro del backend posee sus propias capas de dominio, infraestructura y persistencia, garantizando un acoplamiento casi nulo entre ellos.

---

## 🛠️ Metodología de Trabajo (XP)

El proyecto sigue principios de **Programación Extrema (XP)** y **Arquitectura Limpia**:

1. **Desarrollo Ágil:** Implementación de funcionalidades como micro-proyectos autocontenidos.
2. **Modularidad Estricta:** Cada módulo en el backend y frontend es independiente; si se elimina un módulo, el resto del sistema debe continuar operando sin errores.
3. **Calidad de Código:** Uso de `path-aliases` (`@share/*`, `@modules/*`, `@config/*`) para mantener una estructura de importaciones limpia y legible.
4. **Paridad de Entornos:** Uso de Docker Multi-stage builds para asegurar que lo que corre en local sea idéntico a lo que se desplegará en el servidor de la universidad.

---

## 📋 Requisitos Previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (o Docker Engine + Docker Compose).
- Node.js v20+ (para soporte local de herramientas de CLI).

---

## 🚀 Inicialización Rápida

Para levantar toda la infraestructura del SGP con configuración automática de volúmenes y redes, ejecuta desde la raíz:

```bash
# Levantar el entorno completo en modo detached
docker compose up -d

# Ver los logs de un servicio específico (ej: backend)
docker compose logs -f sgp_api_backend

```

Para asegurar que cualquier cambio en las dependencias sea sincronizado correctamente, siempre instala paquetes nuevos directamente desde el contenedor:

```bash
docker compose exec <nombre_servicio> npm i <nombre-paquete>

```
