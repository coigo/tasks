# AGENTS.md

## Project Overview

Task management system with Go backend (Gin + sqlc + PostgreSQL) and React frontend (Vite + Tailwind + React Router).

## Key Commands

### Backend
```bash
cd api
go run ./cmd/main           # Run API (migrations auto-apply on first run)
go build ./...              # Build
go run github.com/sqlc-dev/sqlc/cmd/sqlc@latest generate  # Regenerate sqlc queries after .sql changes
```

### Frontend
```bash
cd web
npm install
npm run dev                 # Development server
npm run build               # Production build (tsc -b && vite build)
npm run lint                # Run oxlint
```

### Infrastructure
```bash
docker compose up -d       # Start PostgreSQL (port 5433) and MinIO (port 9000)
```

## Architecture Notes

### Backend Layers
- `handlers/` — HTTP handlers (Gin)
- `services/` — Business logic, depend on interfaces in `repository/ports/`
- `repository/` — Database queries via sqlc-generated code
- `models/` — GORM models
- `database/queries.sql` — sqlc query definitions (run `sqlc generate` after editing)
- `database/migrations/` — Goose migrations

### Frontend Structure
- `pages/` — Route components
- `components/` — Reusable UI components
- `hooks/` — Custom React hooks
- `services/api.ts` — Axios API client
- `constants/` — App constants (e.g., `coresSituacao.ts` for situation colors)

### Generated Code
- `api/internal/repository/queries.sql.go` — sqlc generates this from `queries.sql`
- Do NOT edit `queries.sql.go` manually; edit `queries.sql` and run `sqlc generate`

## Critical Conventions

### Database
- All database field names use `snake_case` (e.g., `situacao_id`, `criado_em`)
- All Go struct fields use `camelCase` (e.g., `SituacaoID`, `CriadoEm`)
- JSON responses use `camelCase` for fields (set in struct tags)

### Naming
- All code, tables, and columns use Brazilian Portuguese names
- Examples: `Tarefa`, `Situacao`, `CriadoEm`, `ResponsavelID`

### Local Storage
- Use `hooks/useLocalStorage.ts` for app settings (key: `app-settings`)
- Settings interface is `AppSettings` — add new settings there to avoid duplication

## Common Issues

### Build Failures After DB Changes
If you modify `queries.sql`, regenerate:
```bash
cd api && go run github.com/sqlc-dev/sqlc/cmd/sqlc@latest generate
```

### Frontend Type Errors
- Pre-existing errors in `TarefaDetail.tsx` (camelCase vs snake_case form field mismatch) are known issues, not from recent changes
- Run `npm run build` to verify; `npm run dev` may still work

### Drag-and-Drop (Kanban)
- Uses `@dnd-kit/core` and `@dnd-kit/sortable`
- Column droppable IDs use prefix `column-` (e.g., `column-1`)
- Card IDs are raw task IDs
- Activation distance: 20px to prevent accidental drags

## Environment

- API: `http://localhost:8080`
- Frontend: `http://localhost:5173`
- PostgreSQL: `localhost:5433` (DB: `tasks`, User: `tasks`, Pass: `tasks`)
- MinIO: `localhost:9000` (console at `localhost:9001`)
- Default admin: `admin@admin.com` / `teste@$123`

## Testing Features
- Backend auto-creates admin user on first run
- No dedicated test suite;
