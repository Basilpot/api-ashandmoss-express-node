# Backend (api.be.com)

Express 5 + TypeScript + Prisma 7 (PostgreSQL) API. Serves travel-dashboard, marketing site, and public user API.

```sh
pnpm dev              # ts-node-dev with tsconfig-paths
pnpm build            # tsc && tsc-alias (both required)
pnpm lint             # eslint src — @typescript-eslint/no-explicit-any is OFF
pnpm seed:admin       # platform admin + categories
pnpm seed             # full seed
```

- Entry: `src/server.ts`. Path aliases: `@/` → `src/`, `@root/`, `@config/`, `@lib/`, `@types/`.
- Husky pre-commit: `pnpm lint` → `pnpm build` (order matters — build fails if lint fails).
- Prisma 7 with `prisma/config` `defineConfig` pattern. Schema: `prisma/schema.prisma`. Migrations in `prisma/migrations/` (apply with `npx prisma migrate deploy`).
- ⚠️ After `prisma generate` / `migrate deploy`, RESTART `pnpm dev` — ts-node-dev does not watch the generated client in `node_modules`, so a running server keeps querying the old schema and every DB call 500s ("column does not exist").
- Swagger UI at `/api-docs` (spec from JSDoc in route files).
- Uploads served from `public/uploads` (gitignored).
- `be/data/*.json` are runtime state written by the dashboard editors — do NOT commit, keep `/data` ignored.
- Generated SDK at `.husky/src` is a stray build artifact — ignored, never import from it.
- Known quirk: `/upload/local*` endpoints write files only — they create no `Media` DB row (the dashboard uses `/media-library/upload`, which populates `fileSize`).

Env reference in `.env.example`. Never commit `.env`.
