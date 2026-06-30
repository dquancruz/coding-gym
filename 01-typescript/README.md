# 01 — TypeScript

**Rol en el plan:** Primario en Fase 1. Base de todo el núcleo full-stack.

## Checklist Junior → Mid

- [ ] Tipos básicos sólidos: `interface` vs `type`, uniones, intersecciones
- [ ] Funciones tipadas con sobrecargas cuando aplica
- [ ] Genéricos: funciones y tipos genéricos, constraints (`extends`)
- [ ] Utility types: `Partial`, `Pick`, `Omit`, `Record`, `Readonly`
- [ ] Discriminated unions para modelar estado (no banderas booleanas sueltas)
- [ ] Type guards y narrowing (`is`, `in`, `typeof`, `instanceof`)
- [ ] `unknown` vs `any` — nunca `any` por defecto
- [ ] Tipos condicionales e `infer` (nivel mid-avanzado)
- [ ] Validación en runtime con Zod (los tipos no existen en runtime)
- [ ] `tsconfig.json` en modo `strict`, entender cada flag
- [ ] Async/await tipado correctamente, manejo de `Promise<T>`
- [ ] Tests con Vitest/Jest sobre lógica pura tipada

## Señal de que ya eres mid en este track
Modelas el dominio del problema con tipos (discriminated unions, generics)
ANTES de escribir lógica, y el compilador te avisa de bugs antes de correr el
código — no usas `any` como salida de emergencia.

## Carpetas
- `exercises/` — ejercicios generados por Claude Code
- `solutions/` — soluciones de referencia (tras tu intento)
- `notes/` — tus apuntes
