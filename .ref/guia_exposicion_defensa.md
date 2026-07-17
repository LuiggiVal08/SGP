# GUÍA DE EXPOSICIÓN — DEFENSA PST III (SGP)

> Guía para la defensa. Solo información sustantiva del proyecto, sin citas ni bases teóricas.
> Usar como apoyo oral; los gráficos/cuadros van en el tombo (.docx).

---

## 1. Qué es el proyecto (PARTE I)

**Proyecto Socio Integrador Tecnológico III — SGP (Sistema de Gestión de Proyectos).**
Aplicación web bajo software libre para el **control, registro y recuperación de documentos y proyectos** en la Coordinación del PNF en Informática de la UPTTMBI, Núcleo Territorial "Fabricio Ojeda" Boconó.

**Cómo se construyó:** metodología ágil **Extreme Programming (XP)** para el desarrollo; planificación situacional con **Marco Lógico** para identificar y jerarquizar necesidades.

**Institución:**
- **Razón Social:** UPTT "Mario Briceño Iragorry", Núcleo "Fabricio Ojeda" Boconó. PNF: Administración, Contaduría, Construcción Civil, Electricidad, Informática, Mantenimiento, Mecánica, Psicología Social, Turismo.
- **Misión:** formar profesionales integrales en Informática con compromiso ético-social que diseñen, desarrollen e implanten soluciones tecnológicas libres.
- **Visión:** ser referente territorial en formación de ingenieros en informática y vinculación socio-tecnológica bajo Software Libre.
- **Localización:** Estado Trujillo, Municipio Boconó, Av. Miranda con Calle Andrés Bello.
- **Historia (resumen):** creada 1978 como I.U.T.E.T.; 1980 inicia actividades; 1988 primera extensión en Boconó (Turismo); 2002 denominación I.U.T.E.T. del Estado Trujillo.
- **Organizaciones vinculadas:** UPTTMBI, Núcleo "Fabricio Ojeda" Boconó, Grupo de Proyecto.

---

## 2. Diagnóstico y problema (PARTE I)

**Problema central:** ineficiente gestión, registro y control de documentos y proyectos en la Coordinación del PNF en Informática (archivo manual propenso a pérdida).

**Árbol de Problemas (síntesis):**
- *Efectos:* pérdida de proyectos físicos, tiempos de respuesta lentos, inseguridad/exterior, complicación en censos e inscripciones.
- *Causas:* no existe app web, hardware obsoleto, falta A/A e iluminación, carpetas manuales con errores.

**Árbol de Objetivos (síntesis):**
- *Objetivo central:* optimizar el control, registro y recuperación mediante herramientas tecnológicas.
- *Medios:* app web bajo software libre, actualización de equipos, mejora de iluminación, base de datos.

**Jerarquización de necesidades (resumen):**
- Comunitarias: alumbrado, seguridad, vialidad.
- Institucionales: iluminación, A/A, control de documentos.
- Tecnológicas: digitalización, organización de información, app web de registro y control.

**Cuadro 1 — Actores:** UPTT (facilitador), Coordinación de Informática (colaboración), Grupo de Proyecto (herramienta).

**Selección de alternativa (análisis multicriterio):** se evaluaron 4 alternativas.
- A1 Estrategias administrativas = 4
- **A2 Desarrollo de Software Web de Gestión (SGP) = 12 ← GANADORA**
- A3 Adecuación de infraestructura = 9
- A4 Capacitación tecnológica = 9

---

## 2b. Cuadros y Árboles (visuales para apoyar la defensa)

**Cuadro 1 — Análisis de Actores Involucrados**

| Grupos | Intereses | Problemas Percibidos | Recursos y Mandatos |
|---|---|---|---|
| UPTT Núcleo "Fabricio Ojeda" Boconó (Facilitadores-Participantes) | Determinar problemas, facilitar datos, software libre | Gestión de documentos, actualizar equipos | Optimizar software administrativo (carpetas, grados, censos, inscripciones) |
| Coordinación de Informática | Colaboración tecnológica, flujo de recepción de proyectos | Archivo manual propenso a pérdida, tiempos lentos | Digitalizar "Banco de Proyectos" |
| Grupo de Proyecto | Ofrecer herramienta de calidad | Dificultad en censos/inscripciones, carpetas ineficientes | Nociones de programación |

**Cuadro 2 — Escala de Medición**

| Criterio | Escala |
|---|---|
| Alto | 3 |
| Medio | 2 |
| Bajo | 1 |

**Cuadro 3 — Análisis Cualitativo (selección del problema central)**

| Problemas | Magnitud | Área Afectada | Posibilidad Resolver | Costo Postergación |
|---|---|---|---|---|
| Falta de equipos actualizados | Medio | Medio | Bajo | Alto |
| Filtración en la instalación | Alto | Medio | Alto | Bajo |
| Optimo control y recuperación de documentos | Alto | Alto | Bajo | Alto |
| **Desarrollo de software para registro/control** | **Alto** | **Alto** | **Alto** | **Alto** |
| Carencia de rallado peatonal | Medio | Medio | Alto | Bajo |
| Falta de alumbrado público | Medio | Alto | Medio | Bajo |
| Poca iluminación interna | Medio | Medio | Bajo | Alto |

**Cuadro 4 — Análisis Cuantitativo (puntuación)**

| Problemas | Mag. | Área | Posib. | Costo | Puntuación |
|---|---|---|---|---|---|
| Falta de equipos actualizados | 2 | 2 | 1 | 3 | 8 |
| Filtración en la instalación | 3 | 2 | 1 | 2 | 8 |
| Optimo control y recuperación de documentos | 2 | 3 | 3 | 1 | 9 |
| **Desarrollo de software para registro/control** | **3** | **3** | **3** | **3** | **12** |
| Carencia de rallado peatonal | 2 | 2 | 1 | 3 | 8 |
| Falta de alumbrado público | 2 | 2 | 1 | 2 | 7 |
| Poca iluminación interna | 2 | 2 | 1 | 3 | 8 |

**ÁRBOL 3 — Árbol de Problemas**

```
EFECTOS:        Deterioro y pérdida de      Tiempos lentos en        Inseguridad y          Complicación en censos
                proyectos físicos            trámites adm.            alumbrado público      e inscripciones
                          ▲                         ▲                      ▲                       ▲
PROBLEMA        Ineficiente gestión, registro y control de documentos y proyectos en la Coordinación del PNF en Informática
CENTRAL:                  ▲
CAUSAS:         Inexistencia de app web     Hardware obsoleto        Falta A/A e            Sistema de carpetas
                para control de proyectos    y sin mantenimiento      iluminación interna    manual propenso a errores
```

**ÁRBOL 4 — Árbol de Objetivos**

```
FINES:          Óptima organización      Agilización de          Mejora de seguridad     Eficiencia en censos,
                y digitalización         tiempos de respuesta    vial y alumbrado         inscripciones y grados
                          ▲                         ▲                      ▲                       ▲
OBJETIVO        Optimizar el control, registro y recuperación de documentos y proyectos mediante herramientas
CENTRAL:        tecnológicas e infraestructura adecuada.
                          ▲
MEDIOS:         App web bajo software     Actualización de        Mejora de iluminación   Implementación de base
                libre                      equipos y climatización perimetral               de datos
```

**ÁRBOL 5 — Árbol de Objetivos con Diseño de Alternativas**

```
FINES:          Óptima organización      Agilización de          Mejora de seguridad     Eficiencia en censos,
                y digitalización         tiempos de respuesta    vial y alumbrado         inscripciones y grados
                          ▲                         ▲                      ▲                       ▲
OBJETIVO        Optimizar el control, registro y recuperación de documentos y proyectos mediante herramientas
CENTRAL:        tecnológicas e infraestructura adecuada.
                          ▲
MEDIOS:         App web bajo software     Actualización de        Mejora de iluminación   Implementación de base
                libre                      equipos y climatización perimetral               de datos
                          ▲                         ▲                      ▲                       ▲
DISEÑO DE       A1: Nuevas estrategias    A2: Desarrollo de       A3: Adecuación de        A4: Capacitación
ALTERNATIVAS:   administrativas           Software Web (SGP)      infraestructura          tecnológica al personal
                (* NOTA: A2 seleccionada con 12 puntos — mayor puntaje)
```

**Cuadro — Escalas de Análisis de Alternativas (pesos)**

| Escala | Costo 20% | Tiempo 20% | Impacto Social 10% | Afinidad carrera 20% | Tecnología 30% |
|---|---|---|---|---|---|
| 3 | Alto | Largo | Alto | Mucha | Compleja |
| 2 | Medio | Medio | Medio | Poca | Intermedia |
| 1 | Bajo | Corto | Medio | Poco | Simple |

**Cuadro — Análisis Cuantitativo de Alternativas (puntuación directa 1-3)**

| Alternativas | Costo | Tiempo | Impacto | Afinidad | Tecnología | Puntuación |
|---|---|---|---|---|---|---|
| A1 Estrategias administrativas | 1 | 1 | 1 | 1 | 1 | 4 |
| **A2 Software Web (SGP)** | **3** | **3** | **3** | **3** | **3** | **12** |
| A3 Adecuación infraestructura | 2 | 2 | 2 | 1 | 2 | 9 |
| A4 Capacitación tecnológica | 1 | 2 | 2 | 2 | 2 | 9 |

**Análisis Multi-Criterio (ponderado):**
- A1 = 1,00 | **A2 = 3,00 ← GANADORA** | A3 = 1,80 | A4 = 1,70

---

## 3. Cómo se desarrolló (PARTE III — XP)

**Paradigma:** socio-crítico (investigación como transformación social, con participación activa de la comunidad).
**Tipo:** Investigación-Acción Participativa (IAP) — la encargada de Coordinación participa en requerimientos y validación.
**Diseño:** Marco Lógico (identificación → formulación → ejecución → evaluación).

**Metodología de software — XP (fases):**
1. **Planificación:** propuesta, carta de postulación, solicitud de info institucional, entrevista de requerimientos.
2. **Diseño:** banco de Historias de Usuario, arquitectura (monorepo, limpia), modelo Entidad-Relación.
3. **Codificación e Iteraciones:** entorno Docker (nginx, frontend, backend, mysql, redis); módulos de autenticación/roles/seguridad; primer avance gráfico; mapeo de formatos físicos reales; asesoría de tutor; núcleo del sistema (volúmenes, asignaciones, registro histórico).
4. **Pruebas:** aceptación funcional (Jest backend 33 tests, Vitest frontend 38 tests) + refinamiento estético.
5. **Lanzamiento:** despliegue local en la Coordinación, manuales de usuario, capacitación.

**Técnicas de recolección:** observación directa + conversatorio (con guía de preguntas y revisión de formatos físicos reales).

---

## 4. El producto (PARTE IV — SGP)

**Qué es:** aplicación web full-stack para gestión de Proyectos Socio-Integradores.

**Stack (definiciones cortas):**
- *Frontend:* React 19 + Vite (interfaz que ve el usuario en el navegador).
- *Backend:* NestJS 11 + Sequelize (lógica del sistema y reglas de negocio).
- *Base de datos:* MySQL 8.4 (donde se guarda la información).
- *Caché:* Redis 7 (acelera respuestas frecuentes).
- *Proxy:* Nginx (dirige `/api/*` al backend y `/*` al frontend).
- *Contenedores:* Docker (empaqueta todo para ejecutarlo igual en cualquier equipo).

**Módulos principales:**
- Autenticación y control de roles (RBAC).
- Catálogos académicos (instituciones, carreras, tutores).
- Registro de proyectos, hitos y archivos **TOMO / RESUMEN**.
- Buscador de antecedentes y **estadísticas** (`GET /projects/stats`).

**Pruebas:** 33 backend + 38 frontend (Definition of Done de XP).

**Cuadro 8 — Matriz de Marco Lógico (SGP)**

| Nivel | Resumen / Indicadores | Medios de Verificación | Supuestos |
|---|---|---|---|
| **FIN** | Optimizar el control de documentos y proyectos. 80% archivos digitales (oct), 85% consultas <5 min (sep), 90% personal diestro (oct), 95% trazabilidad (oct) | Bitácora de auditoría, entrevista a encargada, stats `/projects/stats`, acta de aceptación | Equipos actualizados con Software Libre (Canaima) |
| **PROPÓSITO** | Optimizar control, registro y recuperación. 85% tomos con contraparte digital (sep), reuniones de seguimiento | Informe mensual de stats SGP, acta firmada | Conectividad estable en sede |
| **COMPONENTES** | App web SGP bajo XP. Carga masiva operativa (oct), stats en tiempo real (nov) | Pruebas UAT firmadas, repositorio con commits e historias | Grupo formado en NestJS/React/PostgreSQL |

**Cuadro 9 — Cronograma de Actividades (resumen por fase XP)**

| Fase XP | Actividades principales |
|---|---|
| Planificación | Propuesta, carta de postulación, info institucional, entrevista de requerimientos |
| Diseño | Banco de Historias de Usuario, arquitectura + modelo E-R |
| Codificación e Iteraciones | Docker, auth/roles/seguridad, 1er avance gráfico, mapeo de formatos, asesoría tutor, núcleo del sistema |
| Pruebas | Aceptación funcional (Jest/Vitest) + refinamiento estético |
| Lanzamiento | Despliegue local, manuales de usuario, capacitación |

---

## 5. Objetivos y beneficios (PARTE I)

**Propósito general:** implantar la app web SGP para el control, registro y recuperación de documentos y proyectos.

**Específicos:** diagnosticar problemas; establecer requerimientos; diseñar arquitectura + historias; desarrollar la app con XP; ejecutar en producción; capacitar personal; elaborar manual de usuario.

**Línea de investigación:** Aplicación Web (unidad con Programación, Base de Datos, Ingeniería del Software).

**Beneficiarios:**
- *Directos:* Coordinación del PNF en Informática (digitaliza y protege su memoria documental).
- *Indirectos:* grupo investigador, docentes/tutores, comunidad universitaria.

---

## 6. Cierre sugerido (1 minuto)

"El SGP resuelve la gestión manual de proyectos de la Coordinación mediante una aplicación web libre, construida con XP e iteraciones validadas con la encargada. Pasa de un archivo físico propenso a pérdida a un sistema digital con trazabilidad, búsqueda de antecedentes y estadísticas en tiempo real."
