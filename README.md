# Task Manager

Sistema de gestão de tarefas com foco em visualização e relatórios.

## Requisitos

- [Docker](https://www.docker.com/) e Docker Compose
- [Go 1.26+](https://go.dev/)
- [Node.js 24+](https://nodejs.org/)

## Estrutura

- `api/` — Backend em Go (Gin + sqlc + PostgreSQL)
- `web/` — Frontend em React + Vite + Tailwind CSS
- `docker-compose.yml` — PostgreSQL e MinIO

## Configuração

1. Copie o arquivo de exemplo de variáveis de ambiente:

   ```bash
   cp .env.example .env
   cp api/.env.example api/.env
   ```

   > O projeto já possui `.env` e `api/.env` configurados para execução local. Ajuste se necessário.

2. Variáveis principais:

   ```env
   # Banco de dados (PostgreSQL roda na porta 5433 para evitar conflitos)
   DB_HOST=localhost
   DB_PORT=5433
   DB_USER=tasks
   DB_PASS=tasks
   DB_NAME=tasks
   DATABASE_URL=postgres://tasks:tasks@localhost:5433/tasks

   # MinIO
   S3_ENDPOINT=localhost:9000
   S3_ACCESS_KEY=tasks
   S3_SECRET_KEY=taskstasks
   S3_BUCKET=tasks
   S3_USE_SSL=false

   # JWT
   JWT_SECRET=tasks-secret-key-change-in-production

   # Usuário admin inicial
   ADMIN_EMAIL=admin@admin.com
   ADMIN_PASSWORD=teste@$123

   # Porta da API
   APP_PORT=8080
   ```

## Subir a infraestrutura

```bash
docker compose up -d
```

Isso inicia:

- PostgreSQL em `localhost:5433`
- MinIO em `localhost:9000` (console em `http://localhost:9001`)

## Rodar o backend

```bash
cd api
go run ./cmd/main
```

Na primeira execução:

- As migrations do Goose são aplicadas automaticamente.
- O usuário admin é criado com as credenciais definidas em `ADMIN_EMAIL` e `ADMIN_PASSWORD`.

A API ficará disponível em `http://localhost:8080`.

## Rodar o frontend

```bash
cd web
npm install
npm run dev
```

O frontend ficará disponível em `http://localhost:5173`.

## Usuário inicial (seed)

Ao iniciar o backend pela primeira vez, um usuário administrador é criado automaticamente:

- **E-mail:** `admin@admin.com`
- **Senha:** `teste@$123`

Use essas credenciais na tela de login. O admin pode criar os demais usuários pela tela **Usuários**.

## Principais funcionalidades

- Login com JWT (access token de 2 minutos, refresh token de 30 dias)
- CRUD de usuários, projetos, situações e tipos de tarefa
- CRUD de tarefas com numeração reiniciada a cada ano
- Situações marcáveis como "encerra tarefa" (removem da lista de pendentes)
- Movimentações de tarefas com rich text
- Anexos armazenados no MinIO (upload temporário e finalização na criação da tarefa)
- Dashboard com métricas e relatório de tarefas movimentadas por período

## Comandos úteis

```bash
# Recompilar queries sqlc
cd api
go run github.com/sqlc-dev/sqlc/cmd/sqlc@latest generate

# Build de produção do frontend
cd web
npm run build
```
