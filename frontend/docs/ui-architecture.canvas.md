# SGP Frontend — UI Architecture & Loading Flow

Diagrama de la arquitectura de UI y el flujo de carga, generado con el skill `canvas`
(skill: find-skills → canvas). Visualiza el shell, los estados de carga y las
primitivas reutilizables introducidas en esta pasada de mejora.

```canvas
{
  "nodes": [
    {"id": "shell", "type": "group", "label": "RootLayout (shell)", "x": 0, "y": 0, "width": 900, "height": 520, "color": "5"},
    {"id": "sidebar", "type": "text", "text": "Sidebar (Drawer)\nSidebarNavLink\nactive = shadow-1 + primary", "x": 20, "y": 40, "width": 240, "height": 120, "color": "4"},
    {"id": "header", "type": "text", "text": "Header\ntheme switch + user menu\nfocus-visible ring", "x": 300, "y": 40, "width": 260, "height": 100, "color": "4"},
    {"id": "main", "type": "text", "text": "main + Breadcrumbs\nAnimatePresence (reduced-motion safe)", "x": 600, "y": 40, "width": 280, "height": 100, "color": "4"},
    {"id": "loader", "type": "text", "text": "PageLoader (top bar)\nrole=progressbar", "x": 20, "y": 200, "width": 250, "height": 90, "color": "3"},
    {"id": "suspense", "type": "text", "text": "App Suspense\nLoadingState brand splash\n(role=status)", "x": 320, "y": 200, "width": 250, "height": 90, "color": "3"},
    {"id": "skeleton", "type": "text", "text": "Skeleton (shared)\nper-query loading", "x": 620, "y": 200, "width": 250, "height": 90, "color": "3"},
    {"id": "ui", "type": "group", "label": "Primitivas ui/", "x": 20, "y": 340, "width": 860, "height": 150, "color": "6"},
    {"id": "card", "type": "text", "text": "Card\n(elevated + accent bar)", "x": 40, "y": 380, "width": 180, "height": 80, "color": "6"},
    {"id": "stat", "type": "text", "text": "StatCard\n(KPI tile)", "x": 250, "y": 380, "width": 180, "height": 80, "color": "6"},
    {"id": "header2", "type": "text", "text": "PageHeader\n(accent bar)", "x": 460, "y": 380, "width": 180, "height": 80, "color": "6"},
    {"id": "skel2", "type": "text", "text": "Skeleton\n(loading)", "x": 670, "y": 380, "width": 180, "height": 80, "color": "6"}
  ],
  "edges": [
    {"id": "e1", "fromNode": "loader", "fromSide": "top", "toNode": "header", "toSide": "bottom", "toEnd": "arrow"},
    {"id": "e2", "fromNode": "suspense", "fromSide": "top", "toNode": "main", "toSide": "bottom", "toEnd": "arrow"},
    {"id": "e3", "fromNode": "skeleton", "fromSide": "top", "toNode": "main", "toSide": "bottom", "toEnd": "arrow"},
    {"id": "e4", "fromNode": "sidebar", "fromSide": "right", "toNode": "main", "toSide": "left", "toEnd": "arrow"}
  ]
}
```

## Design tokens (theme.css)
- **Tipografía**: `Sora` (display/headings) + `IBM Plex Sans` (body) — distintivas, no genéricas.
- **Color**: primary/accent indigo, semantic success/warning/danger, superficies oklch.
- **Elevación**: `--shadow-1..4` (cards → modals).
- **Focus**: anillo `2px var(--focus)` global `:focus-visible`.
- **Reduced-motion**: animaciones desactivadas vía `@media (prefers-reduced-motion: reduce)`.

## Charts (DashboardPage, recharts)
- Pie/Año/Tutores animados: `animationBegin` escalonado 150–250ms, `duration` 500–600ms, easing `ease-out`.
- Colores unificados a tokens (`--color-success/warning/danger/primary`).
- `<title>` accesible en cada gráfico.
