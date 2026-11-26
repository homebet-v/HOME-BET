#!/usr/bin/env bash
set -euo pipefail

domain=${1:?Uso: bash scripts/check-staging.sh dominio.example}
scheme=https
port=
if [[ "$domain" == localhost ]]; then
  scheme=http
  port=:3000
fi

body=$(mktemp)
trap 'rm -f "$body"' EXIT

check() {
  local url=$1 expected=$2 marker=${3:-} status
  status=$(curl --silent --show-error --max-time 30 --output "$body" --write-out '%{http_code}' "$url")
  if [[ "$status" != "$expected" ]] || { [[ -n "$marker" ]] && ! rg -Fq "$marker" "$body"; }; then
    printf 'Falló %s (HTTP %s, esperado %s, contenido esperado %s)\n' "$url" "$status" "$expected" "$marker" >&2
    return 1
  fi
  printf 'OK %s (%s)\n' "$url" "$status"
}

check "$scheme://$domain$port/" 200 'Ingresar a Home'
check "$scheme://home.$domain$port/" 200 'Ingresar a Home'
for house in krakenbet kairobet; do
  check "$scheme://$house.$domain$port/juegos" 200 'data-screen="casa-juegos"'
  check "$scheme://$house-admin.$domain$port/juegos" 200 'Ingresar al panel de la casa'
done
check "$scheme://home.$domain$port/s/home" 307
check "$scheme://krakenbet.$domain$port/ruta-inexistente" 404
