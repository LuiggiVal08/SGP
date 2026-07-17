# SGP — Metodología de Desarrollo

**Metodología de ingeniería del sistema: XP (Extreme Programming).**

> Esta es la metodología que usamos para **desarrollar el sistema SGP**.
> NO debe confundirse con las metodologías que los estudiantes reportan en los
> resúmenes de sus proyectos (RUP, Marco Lógico, Scrum, etc.), las cuales son
> **contenido de los proyectos estudiantiles**, no de la construcción de este software.

## Principios XP a aplicar en SGP

- **Iteraciones cortas**: entregas pequeñas y frecuentes por módulo (auth, catálogos, proyectos, defensa, etc.).
- **Historias de usuario**: cada requisito del `docs/requisitos.md` se descompone en stories priorizadas.
- **Desarrollo dirigido por pruebas (TDD)**: el backend ya cuenta con suites jest (`npm test`, e2e); mantener cobertura.
- **Integración continua**: Docker como runtime único (`docker compose up -d --build`); rebuild tras cambios de dependencias.
- **Refactorización continua**: respetar lint estricto (tseslint type-checked backend, ESLint flat frontend) y path aliases.
- **Propiedad colectiva del código**: vertical-slice backend (`src/modules/*`), folder-by-feature frontend (`src/features/*`).
- **Simplicidad**: modelo de datos ya acotado (1 tutor comunitario, 2 tipos de archivo, correcciones sobre TOMO).

## Referencias

- Requisitos funcionales: `docs/requisitos.md`
- Modelo de datos: `docs/dbml/sgp.dbml`
- Arquitectura y convenciones: `AGENTS.md`
