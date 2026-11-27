#!/usr/bin/env bash
# Deploy da Task API com Docker Compose, com health check e rollback automático.
#
# Uso:   ./scripts/deploy.sh [tag]            (padrão: latest)
# Env:   IMAGE      imagem no registry   (padrão: ghcr.io/brunopssos/devops_fase1)
#        HOST_PORT  porta publicada      (padrão: 3000)
#        TIMEOUT    segundos de espera pelo health check (padrão: 60)
set -euo pipefail

cd "$(dirname "$0")/.."

export IMAGE="${IMAGE:-ghcr.io/brunopssos/devops_fase1}"
export HOST_PORT="${HOST_PORT:-3000}"
NOVA_TAG="${1:-latest}"
TIMEOUT="${TIMEOUT:-60}"
ARQUIVO_TAG_ATUAL=".deploy_tag_atual"

log() { echo "[deploy] $*"; }

esperar_saudavel() {
  local limite=$((SECONDS + TIMEOUT))
  while [ "$SECONDS" -lt "$limite" ]; do
    if curl -fsS "http://127.0.0.1:${HOST_PORT}/health" >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done
  return 1
}

TAG_ANTERIOR=""
if [ -f "$ARQUIVO_TAG_ATUAL" ]; then
  TAG_ANTERIOR="$(cat "$ARQUIVO_TAG_ATUAL")"
fi

log "Baixando ${IMAGE}:${NOVA_TAG}"
IMAGE_TAG="$NOVA_TAG" docker compose pull

log "Subindo a nova versão (${NOVA_TAG})"
IMAGE_TAG="$NOVA_TAG" docker compose up -d --remove-orphans

if esperar_saudavel; then
  echo "$NOVA_TAG" > "$ARQUIVO_TAG_ATUAL"
  log "Deploy concluído: ${NOVA_TAG} respondendo em http://127.0.0.1:${HOST_PORT}/health"
  exit 0
fi

log "ERRO: a nova versão não ficou saudável em ${TIMEOUT}s. Últimos logs:"
IMAGE_TAG="$NOVA_TAG" docker compose logs --tail=30 api || true

if [ -n "$TAG_ANTERIOR" ] && [ "$TAG_ANTERIOR" != "$NOVA_TAG" ]; then
  log "Rollback para a versão anterior (${TAG_ANTERIOR})"
  IMAGE_TAG="$TAG_ANTERIOR" docker compose up -d --remove-orphans
  if esperar_saudavel; then
    log "Rollback concluído."
  else
    log "ERRO: o rollback também falhou."
  fi
else
  log "Não há versão anterior registrada; nenhum rollback possível."
fi
exit 1
