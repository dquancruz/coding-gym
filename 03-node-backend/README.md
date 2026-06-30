# 03 — Node Backend

**Rol en el plan:** Secundario en Fase 1.

## Checklist Junior → Mid

- [ ] Un endpoint REST básico con Express/Fastify
- [ ] Estructura por capas: rutas → controlador → servicio → repositorio
- [ ] Validación de entrada (Zod) antes de tocar lógica de negocio
- [ ] Manejo de errores centralizado (middleware de errores, no try/catch suelto)
- [ ] Status codes y respuestas REST consistentes
- [ ] Auth: JWT o sesiones, hashing de contraseñas (bcrypt/argon2)
- [ ] Middlewares (logging, auth, rate limiting)
- [ ] Async sin fugas (no swallow de promesas, no race conditions)
- [ ] Variables de entorno y configuración por ambiente
- [ ] NestJS (opcional, nivel mid-avanzado): inyección de dependencias, módulos
- [ ] Tests de integración (supertest) además de unitarios
- [ ] Conexión a base de datos con un ORM (Prisma/TypeORM) — ver track 05 SQL

## Señal de que ya eres mid en este track
Tu API no se cae por un input raro: validas en el borde, separas
responsabilidades, y un error nunca llega al cliente como un stack trace crudo.

## Carpetas
- `exercises/` — ejercicios generados por Claude Code
- `solutions/` — soluciones de referencia (tras tu intento)
- `notes/` — tus apuntes
