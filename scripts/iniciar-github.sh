#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
remote=https://github.com/homebet-v/HOME-BET.git

if ! command -v gh >/dev/null; then
  printf '%s\n' 'Instalá GitHub CLI (gh) y volvé a ejecutar el script.' >&2
  exit 1
fi

if ! gh auth status --hostname github.com >/dev/null 2>&1; then
  gh auth login --hostname github.com --git-protocol https --web
fi
gh auth setup-git --hostname github.com

if ! refs=$(git ls-remote --heads --tags "$remote"); then
  printf '%s\n' 'No se pudo acceder a HOME-BET con la cuenta activa de GitHub.' >&2
  exit 1
fi

if [[ "$(git rev-parse --show-toplevel 2>/dev/null || true)" != "$(pwd -P)" ]]; then
  if [[ -n "$refs" ]]; then
    printf '%s\n' 'HOME-BET ya tiene historial. Cloná el remoto antes de incorporar estos archivos.' >&2
    exit 1
  fi
  git init -b main
fi

if origin=$(git remote get-url origin 2>/dev/null); then
  if [[ "$origin" != "$remote" ]]; then
    printf 'origin ya apunta a %s. Revisalo antes de continuar.\n' "$origin" >&2
    exit 1
  fi
else
  git remote add origin "$remote"
fi

git status --short
printf '\nRepositorio vinculado. Revisá los archivos antes de hacer el primer commit.\n'
