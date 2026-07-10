# Rebasear sin pánico
- **Track / Skill:** Fundamentals / Git (branches, rebase vs. merge, resolver conflictos sin pánico, commits atómicos)
- **Target level:** 🟥
- **Estimated time:** 1h

## Context
Estuviste dos días trabajando en una rama `feature` sobre el catálogo de
precios de un local. Mientras tanto, alguien más subió un cambio a `main`
que toca **la misma línea** que vos tocaste, por una razón distinta a la
tuya. Ahora tu rama está atrasada y necesitás traer los cambios de `main`
sin perder ninguno de los dos cambios legítimos — ni el tuyo, ni el de la
otra persona.

Además, tu propia rama tiene un commit `wip: arreglar precio del te, estaba
mal` que nunca debería haber quedado como commit separado — es un error tuyo
corrigiéndose a sí mismo, no información útil para quien lea la historia
después.

Esto **no es un ejercicio de código** — es un ejercicio de Git. Todo el
trabajo sucede en un mini-repo aislado (`sandbox/`) que generás vos mismo con
el script de setup. No toca el repo de `coding-gym` en ningún momento.

## Setup
Desde esta carpeta, corré:
```bash
bash setup/crear-escenario.sh
```
Esto crea `sandbox/` (un repo git nuevo, separado) con dos ramas ya
divergidas: `main` (2 commits) y `feature` (3 commits, parada ahí mismo). El
script imprime el `git log --all --oneline --graph` del punto de partida.
`sandbox/` está en `.gitignore` — podés correr el script de nuevo en
cualquier momento para resetear el escenario desde cero si te trabás.

## Requirements (acceptance criteria)
- [ ] Adentro de `sandbox/`, rebaseá `feature` sobre la punta actual de
  `main` (no un merge — la historia final tiene que quedar lineal).
- [ ] Vas a toparte con un conflicto real en `precios.txt`, en la línea del
  café: `main` la cambió por una razón (suba de precio) y `feature` la
  cambió por otra (rename del producto). Resolvé el conflicto combinando
  **ambos** cambios — no elijas un solo lado (`--ours`/`--theirs` a ciegas
  pierde el cambio de la otra persona).
- [ ] El commit `wip: arreglar precio del te, estaba mal` no puede quedar
  como commit separado en la historia final — squasheálo en el commit al
  que corrige, usando rebase interactivo. Al terminar, `feature` tiene
  exactamente **1 commit** por encima de `main`.
- [ ] Ese commit final tiene un mensaje que describe el cambio real (no
  "wip", no "fix"), como si lo fuera a leer alguien en 6 meses.
- [ ] Escribí 3-4 líneas en `notes/decision.md`: ¿por qué rebase y no merge
  acá? ¿Cómo decidiste qué contenido final poner en la línea en conflicto?
- [ ] Corré `bash tests/verificar.sh` y que todos los chequeos den OK antes
  de pedir `review`.

## Constraints
- Todo el trabajo de git (checkout, rebase, resolución de conflictos) pasa
  **adentro de `sandbox/`**. No hagas `git rebase`, `git checkout -b`, etc.
  en el repo de `coding-gym` — es un repo git completamente aparte, generado
  por vos.
- No se permite `git reset --hard` para "empezar de nuevo a mano": si te
  trabás, corré `bash setup/crear-escenario.sh` otra vez, que resetea todo
  limpio.
- No hagas el conflicto a las apuradas: el objetivo del ejercicio es que el
  contenido final tenga sentido de negocio (el café sigue costando lo que
  subió a $4.00, pero ahora se llama "café negro"), no solo que Git deje de
  quejarse.

## Hints
- `git checkout feature` (si no estás ahí ya) y después `git rebase main`.
  Git te va a avisar del conflicto y va a dejar marcado el archivo con
  `<<<<<<<`, `=======`, `>>>>>>>`.
- Editá `precios.txt` a mano para dejar la línea como corresponde, sacá los
  marcadores de conflicto, `git add precios.txt`, y `git rebase --continue`.
- Para squashear el commit `wip`, dos caminos válidos, elegí el que te sea
  más cómodo:
  - Antes de rebasear: `git rebase -i main` y marcá el segundo commit como
    `fixup` (o `f`) en vez de `pick` — el squash pasa automáticamente
    después de resolver el conflicto del primero.
  - Después de rebasear (con los 2 commits ya arriba de main): `git rebase
    -i HEAD~2` y marcá el segundo como `fixup`.
- Si `git rebase -i` te abre un editor que no conocés y no sabés cómo
  guardar y salir, decime qué editor te aparece (`vi`, `nano`, etc.) y te
  explico los comandos básicos antes de que lo intentes.

## Stretch goals (optional, to push toward the next level)
- Después de terminar, corré `git reflog` en `sandbox/` y mirá cómo quedó
  registrado cada paso del rebase — es lo que usarías para recuperarte si
  el rebase salía mal.
- Pensá (no hace falta implementarlo): si en vez de 1 conflicto en 1 línea
  hubieran sido conflictos en 5 archivos distintos, ¿seguirías con
  `rebase` o preferirías `merge`? ¿Por qué cambia la respuesta con el
  tamaño del conflicto?
