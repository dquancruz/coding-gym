# 02 — React + Next.js

**Rol en el plan:** Primario en Fase 1 (tras consolidar TS básico).

## Checklist Junior → Mid

- [ ] Componentes funcionales + props tipadas
- [ ] `useState`/`useEffect` con criterio (no `useEffect` para todo)
- [ ] Hooks personalizados para extraer lógica reutilizable
- [ ] `useMemo`/`useCallback` — saber CUÁNDO sirven (no usarlos por reflejo)
- [ ] Manejo de listas, keys, formularios controlados
- [ ] Next.js App Router: layouts, rutas anidadas, `loading.tsx`, `error.tsx`
- [ ] Server Components vs Client Components — cuándo usar cada uno
- [ ] Data fetching en el servidor, streaming, Suspense
- [ ] Server Actions para mutaciones (sin API routes intermedios)
- [ ] Estado servidor vs estado cliente (no todo es `useState`)
- [ ] Accesibilidad básica (semántica HTML, labels, foco)
- [ ] Evitar renders innecesarios (entender el por qué, no solo el "cómo")
- [ ] Tailwind para estilos, sin pelear con CSS global
- [ ] Tests de componentes (React Testing Library)

## Señal de que ya eres mid en este track
Decides conscientemente qué corre en servidor y qué en cliente, y tu primer
instinto ante un bug de performance es entender el render tree, no agregar
`useMemo` a ciegas.

## Carpetas
- `exercises/` — ejercicios generados por Claude Code
- `solutions/` — soluciones de referencia (tras tu intento)
- `notes/` — tus apuntes
