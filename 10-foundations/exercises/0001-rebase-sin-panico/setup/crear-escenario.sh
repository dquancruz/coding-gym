#!/usr/bin/env bash
# Genera el escenario de práctica en ./sandbox — un repo git AISLADO, separado
# del repo de coding-gym. Correr este script no toca nada fuera de esa carpeta.
# Se puede correr de nuevo en cualquier momento para resetear el escenario
# desde cero (borra y recrea sandbox/).
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/sandbox"

rm -rf "$DIR"
mkdir -p "$DIR"
cd "$DIR"

git init -q -b main
git config user.email "vos@ejemplo.com"
git config user.name "Vos"

cat > precios.txt <<'EOF'
producto,precio
cafe,3.50
medialuna,1.20
EOF
git add precios.txt
git commit -q -m "chore: catalogo inicial de precios"

git checkout -q -b feature

cat > precios.txt <<'EOF'
producto,precio
cafe negro,3.50
medialuna,1.20
te,2.0
EOF
git add precios.txt
git commit -q -m "feat: renombrar cafe a 'cafe negro' y agregar te al catalogo"

cat > precios.txt <<'EOF'
producto,precio
cafe negro,3.50
medialuna,1.20
te,2.50
EOF
git add precios.txt
git commit -q -m "wip: arreglar precio del te, estaba mal"

git checkout -q main

cat > precios.txt <<'EOF'
producto,precio
cafe,4.00
medialuna,1.20
EOF
git add precios.txt
git commit -q -m "chore: subir precio del cafe por inflacion"

git checkout -q feature

echo "Escenario listo en: $DIR"
echo ""
echo "Historia actual (main y feature ya divergieron):"
git log --all --oneline --graph
