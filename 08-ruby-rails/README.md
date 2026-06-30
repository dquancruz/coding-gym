# 10 — Ruby on Rails

**Rol en el plan:** Mantenimiento (1 ejercicio/semana rotando) desde el día uno.
Sube a secundario en Fase 2 si tu objetivo es producto/startup.

## Checklist Junior → Mid

- [ ] Convenciones de Rails (convention over configuration) con criterio
- [ ] ActiveRecord: asociaciones (`has_many`, `belongs_to`), validaciones
- [ ] Detectar y evitar queries N+1 (`includes`, `bullet` gem)
- [ ] Servicios/concerns para sacar lógica de los modelos "gordos"
- [ ] Controladores REST delgados (la lógica vive en servicios, no en el controlador)
- [ ] Background jobs (Sidekiq/ActiveJob) para trabajo pesado
- [ ] Modo API (`--api`) cuando el frontend es separado (React/Next)
- [ ] Tests con RSpec: modelos, requests, factories (FactoryBot)
- [ ] Migraciones seguras (reversibles, sin downtime en producción)

## Señal de que ya eres mid en este track
Sabes cuándo seguir "la forma Rails" te ahorra tiempo y cuándo romper la
convención es la decisión correcta — y tus modelos no tienen 300 líneas de
lógica de negocio mezclada con persistencia.

## Carpetas
- `exercises/` — ejercicios generados por Claude Code
- `solutions/` — soluciones de referencia (tras tu intento)
- `notes/` — tus apuntes
