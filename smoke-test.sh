#!/usr/bin/env bash
# Teste de fumaça: valida a API depois do deploy, usando só curl.
# Uso: ./scripts/smoke-test.sh [url-base]   (padrão: http://127.0.0.1:3000)
set -euo pipefail

BASE="${1:-http://127.0.0.1:3000}"
falhas=0

checar() {
  local descricao="$1" esperado="$2" obtido="$3"
  if [ "$obtido" = "$esperado" ]; then
    echo "OK   $descricao (HTTP $obtido)"
  else
    echo "FALHA $descricao: esperado HTTP $esperado, obtido $obtido"
    falhas=$((falhas + 1))
  fi
}

status() { curl -s -o /dev/null -w '%{http_code}' "$@"; }

checar "GET /health" 200 "$(status "$BASE/health")"
checar "POST /tarefas" 201 "$(status -X POST -H 'Content-Type: application/json' -d '{"titulo":"smoke test"}' "$BASE/tarefas")"
checar "GET /tarefas" 200 "$(status "$BASE/tarefas")"
checar "PATCH /tarefas/1/concluir" 200 "$(status -X PATCH "$BASE/tarefas/1/concluir")"
checar "DELETE /tarefas/1" 204 "$(status -X DELETE "$BASE/tarefas/1")"
checar "POST /tarefas sem título" 400 "$(status -X POST -H 'Content-Type: application/json' -d '{}' "$BASE/tarefas")"

if [ "$falhas" -gt 0 ]; then
  echo "$falhas verificação(ões) falharam."
  exit 1
fi
echo "Smoke test concluído com sucesso."
