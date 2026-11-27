# Task API: DevOps na Prática

API REST simples de tarefas (Node.js + Express) usada como aplicação-alvo para praticar o ciclo DevOps:
integração contínua, entrega contínua, containers, logs, segurança básica e infraestrutura como código.

## Endpoints

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET | `/health` | Health check (usado pelo Docker e pelo deploy) |
| GET | `/tarefas` | Lista as tarefas |
| POST | `/tarefas` | Cria tarefa (`{"titulo": "..."}`) |
| PATCH | `/tarefas/:id/concluir` | Marca como concluída |
| DELETE | `/tarefas/:id` | Remove a tarefa |

## Desenvolvimento local

```bash
npm install
npm run lint
npm test          # Jest + Supertest, com cobertura
npm start         # http://localhost:3000
```

## Containers

```bash
# build e execução local
docker compose up -d --build
curl http://localhost:3000/health
docker compose logs -f api      # logs estruturados em JSON
docker compose down
```

A imagem usa `node:20-alpine`, roda como usuário não-root (`node`), tem `HEALTHCHECK` e, no Compose,
sistema de arquivos somente leitura, `cap_drop: ALL` e `no-new-privileges`.

## Pipeline (`.github/workflows/ci.yml`)

Em todo push e pull request na `main`:

1. **Lint e testes** (Node 18 e 20) com relatório de cobertura
2. **Segurança**: `npm audit` das dependências de produção
3. **Build da imagem Docker**
4. **Terraform**: `fmt`, `init` e `validate`

Somente em push na `main`, depois que tudo acima passar (**Entrega Contínua**):

5. **Publicar imagem** no GitHub Container Registry (`ghcr.io/<usuario>/<repo>`), com as tags `latest` e o SHA do commit
6. **Deploy** com `scripts/deploy.sh`: `docker compose pull` e `up -d`, espera o `/health` responder
   e faz **rollback automático** para a tag anterior se a nova versão não ficar saudável; depois roda `scripts/smoke-test.sh`

## Deploy manual

```bash
export IMAGE=ghcr.io/brunopssos/devops_fase1
bash scripts/deploy.sh <tag>        # ex.: latest ou o SHA de um commit
bash scripts/smoke-test.sh http://127.0.0.1:3000
```

## Infraestrutura como código

`terraform/` provisiona uma instância EC2 (t2.micro, Amazon Linux 2023 com Docker) e um Security Group
(portas 22, 80 e 3000) na AWS. Veja `variables.tf` para os parâmetros.

## Fluxogramas

`docs/fluxo-ci.png` e `docs/fluxo-cd.png` (fontes em Mermaid: `docs/*.mmd`).
