Desagregación de las Actividades (Metodología XP — Programación Extrema)

Una vez obtenida la alternativa ganadora (A2: Desarrollo de Software Web de Gestión — SGP, con 12 puntos), es necesario enmarcar su desarrollo bajo una metodología para ejecutarla de manera sistematizada y organizada, asegurando su efectividad. Para ello se hace uso de la metodología **XP (Programación Extrema)**, la cual organiza el ciclo de vida en fases iterativas e incrementales: Planificación, Diseño, Codificación e Iteraciones, Pruebas y Lanzamiento. Cada fase agrupa Historias de Usuario (Card / Conversation / Confirmation) definidas en el spec XP (docs/SPEC.md), agrupadas en 10 épicas (A–J, 28 historias).

A diferencia de las metodologías prescritivas (como RUP), XP prioriza la comunicación constante con el cliente, la simplicidad, la retroalimentación temprana y el respeto al equipo, entregando software funcional en cada iteración.

Fase de Planificación (XP)
- Planteamiento de la propuesta de Proyecto III a la Coordinación de Informática para solucionar el control de tomos y registros.
- Entrega de la Carta de Postulación y aceptación formal del proyecto en la institución.
- Solicitud de la información institucional (Misión, Visión, flujos de trabajo actuales y diagnóstico tecnológico).
- Recolección de Datos: aplicación de técnica de entrevista a la encargada para levantar los requerimientos del SGP.

Fase de Diseño (XP)
- Análisis de requerimientos y redacción del banco inicial de Historias de Usuario (HU) en conjunto con el cliente.
- Diseño de la Arquitectura del Software (estructura de monorepo y arquitectura limpia) y modelado Entidad-Relación de la base de datos (docs/dbml/sgp.dbml).

Fase de Codificación e Iteraciones (XP)
- Configuración del entorno de desarrollo local mediante virtualización aislada con Docker (docker compose: nginx, frontend, backend, mysql, redis).
- Programación de la Aplicación Web: desarrollo del Módulo de Autenticación, control de Roles (RBAC) y Seguridad (épica A: A1 Login, A2 Recuperación, A3 Roles; épicas B–C catálogos y actores).
- Presentación del primer avance gráfico: demostración de pantallas del prototipo e interfaces del panel a la encargada de la Coordinación.
- Solicitud formal de los formatos físicos y libros de registros reales para el mapeo y vaciado de datos de prueba.
- Asesoría con el tutor académico para la validación y control metodológico del avance.
- Segunda fase de programación activa: construcción del núcleo del sistema (Módulos de Gestión de Volúmenes, Asignaciones y Registro Histórico — épicas D–E, G hitos/archivos).
- Asesoría con el tutor académico para el chequeo de la documentación técnica, ingeniería del software y pruebas de código.

Fase de Pruebas (XP)
- Ejecución de pruebas de aceptación funcionales integradas (Jest backend 33 tests, Vitest frontend 38 tests) y refinamiento estético de interfaces basadas en el feedback del cliente.

Fase de Lanzamiento (XP)
- Despliegue controlado del sistema e instalación del entorno productivo local en la infraestructura física de la Coordinación.
- Implantación definitiva del SGP, entrega formal de manuales de usuario y capacitación técnica al personal administrativo.
