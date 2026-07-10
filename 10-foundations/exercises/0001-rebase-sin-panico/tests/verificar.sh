#!/usr/bin/env bash
# Chequeo estructural del resultado, corré esto DESPUÉS de terminar el
# ejercicio. No reemplaza la review — solo pesca los errores obvios antes
# de pedirla (historia no lineal, commit wip sin squashear, contenido final
# incorrecto).
set -uo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/sandbox"
cd "$DIR" || { echo "No existe sandbox/ — corré setup/crear-escenario.sh primero."; exit 1; }

fallos=0

check() {
  local descripcion="$1"
  local resultado="$2"
  if [ "$resultado" -eq 0 ]; then
    echo "OK   - $descripcion"
  else
    echo "FAIL - $descripcion"
    fallos=$((fallos + 1))
  fi
}

# 1. feature tiene que estar basado en la punta actual de main (rebase hecho,
#    no un merge que deja main "atrás" de feature de otra forma).
git merge-base --is-ancestor main feature
check "feature está rebaseado sobre la punta de main" $?

# 2. Exactamente 1 commit de feature por encima de main → el wip fue
#    squasheado, no quedan 2 commits sueltos.
n_commits=$(git log --oneline main..feature | wc -l | tr -d ' ')
[ "$n_commits" -eq 1 ]
check "feature tiene exactamente 1 commit sobre main (wip squasheado), encontrados: $n_commits" $?

# 3. Ningún commit de feature por encima de main dice "wip" en el mensaje.
if [ "$n_commits" -gt 0 ]; then
  ! git log main..feature --format=%s | grep -qi "wip"
  check "ningún commit final tiene 'wip' en el mensaje" $?
fi

# 4. Historia lineal: sin commits de merge en feature.
n_merges=$(git log feature --merges --oneline | wc -l | tr -d ' ')
[ "$n_merges" -eq 0 ]
check "no hay commits de merge (historia lineal)" $?

# 5. Contenido final: el conflicto se resolvió combinando AMBOS cambios
#    (el rename de main->cafe negro Y la suba de precio de main->4.00),
#    no eligiendo un solo lado a ciegas.
esperado="producto,precio
cafe negro,4.00
medialuna,1.20
te,2.50"
actual="$(cat precios.txt)"
[ "$actual" = "$esperado" ]
check "precios.txt combina el rename Y la suba de precio (no eligió un solo lado)" $?

echo ""
if [ "$fallos" -eq 0 ]; then
  echo "Todo OK estructuralmente. Pedí 'review' cuando quieras."
else
  echo "$fallos chequeo(s) fallaron — revisá antes de pedir review."
fi
