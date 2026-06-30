# 05 — SQL & Bases de datos

**Rol en el plan:** Secundario en Fase 2. Transversal a todo el plan.

## Checklist Junior → Mid

- [ ] `SELECT`, `WHERE`, `ORDER BY`, `LIMIT` con soltura
- [ ] JOINs (inner, left, right, full) y entender cuándo usar cada uno
- [ ] Agregaciones (`GROUP BY`, `HAVING`) sin confundir con `WHERE`
- [ ] Subconsultas y CTEs (`WITH`) para queries legibles
- [ ] Window functions (`ROW_NUMBER`, `RANK`, `LAG/LEAD`)
- [ ] Índices: cuándo ayudan, cuándo no, leer un `EXPLAIN`
- [ ] Normalización (1FN–3FN) y cuándo desnormalizar a propósito
- [ ] Transacciones, niveles de aislamiento (lo esencial)
- [ ] Modelado de relaciones (1-1, 1-N, N-N) con claves foráneas correctas
- [ ] ORMs (Prisma/SQLAlchemy/EF Core): cuándo confiar en ellos y cuándo bajar a SQL crudo
- [ ] Detectar y evitar N+1 queries
- [ ] SQL vs NoSQL: criterio para elegir, no dogma

## Señal de que ya eres mid en este track
Antes de escribir un query lento, sabes leer el plan de ejecución y explicar
por qué es lento. Diseñas el esquema pensando en las queries que vas a hacer,
no al revés.

## Carpetas
- `exercises/` — ejercicios generados por Claude Code
- `solutions/` — soluciones de referencia (tras tu intento)
- `notes/` — tus apuntes
