# api.be.com — Travel Agency Backend

Express 5 + TypeScript + Prisma 7 (PostgreSQL) API for the travel agency platform. Serves three client surfaces: the **travel-dashboard** (admin), the **marketing** site (public), and a public **user-facing** API.

## Tech stack

- **Express 5** (async handlers via `express-async-handler`)
- **Prisma 7** (`prisma-client-js` generator, `@prisma/adapter-pg`, `prisma.config.ts` `defineConfig` pattern)
- **PostgreSQL** (via `pg`)
- **Auth**: JWT (httpOnly cookies) — three independent auth surfaces (staff/tenant, platform admin, site users)
- **Validation**: zod 4
- **Payments**: Stripe Checkout + webhooks (one-time booking payments)
- **Email**: nodemailer (SMTP via `EMAIL_USER`/`EMAIL_PASS`), templated booking-confirmed + newsletter emails
- **AI**: Anthropic (Claude) itinerary generation (`claude.ts`, `prompts/`)
- **Misc**: multer + sharp (image upload), pdfkit (PDF generation), winston (logging), helmet, cors, express-rate-limit, swagger-jsdoc (spec at `/api-docs`)

## Getting started

1. Install: `pnpm install` (pnpm 10, `packageManager: pnpm@10.31.0`)
2. Copy `.env.example` → `.env` and fill values (see [Environment](#environment))
3. `npx prisma migrate deploy` — apply `prisma/migrations/`
4. Seed:
   - `pnpm seed:admin` — platform admin + categories
   - `pnpm seed` — full seed (tenants, demo content)
5. `pnpm dev` — ts-node-dev with tsconfig-paths on `src/server.ts`

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Dev server (ts-node-dev, hot restart) |
| `pnpm start` | Run built output (`dist/server.js`) |
| `pnpm build` | `tsc && tsc-alias` (BOTH steps required for path aliases) |
| `pnpm lint` | ESLint over `src` (`@typescript-eslint/no-explicit-any` is OFF) |
| `pnpm lint:fix` | ESLint with `--fix` |
| `pnpm seed` | Full seed |
| `pnpm seed:admin` | Admin + categories seed |
| `npx prisma migrate dev` | Create/apply migrations |

Husky `pre-commit` runs `pnpm lint` → `pnpm build` (order matters). Both must pass to commit.

## Project structure

```
src/
├── server.ts                 # entry, app bootstrap
├── configs/                  # env, cors, multer, smtp
├── constants/                # messages, status codes
├── controllers/              # one directory per resource, one file per action
├── middlewares/              # auth + tenant scoping + error handling
├── routes/                   # route definitions (JSDoc drives Swagger spec)
├── services/                 # pdf.service
├── seeder/                   # seed.ts, admin.seed.ts
├── prompts/                  # AI generation prompts
├── utils/                    # claude, email, slugify, price, templates, etc.
├── validations/              # zod schemas
├── enums/                    # activityStatus
├── types/                    # shared TS types (express.d.ts, etc.)
├── docs/                     # additional docs
└── images/                   # image assets
```

Route files live flat in `routes/` and are aggregated by `routes/index.route.ts` (v1) and `routes/v1/index.route.ts`. Swagger spec is generated from JSDoc tags in route files and served at `/api-docs`.

## Path aliases

| Alias | Resolves to |
|---|---|
| `@/` | `src/` |
| `@root/` | repo root |
| `@config/`, `@lib/`, `@types/` | `src/configs`, `src/lib`, `src/types` |

Aliases are compiled by `tsc-alias` during `build` — `tsc` alone leaves them unresolved.

## Data model (Prisma)

`prisma/schema.prisma`, migrations in `prisma/migrations/`:

- **Multi-tenant core**: `Tenant` (slug, status), `TenantStaff` (staff/owner accounts), `User` (public site users, scoped per tenant)
- **Admin**: `Admin` (platform admins)
- **Travel content**: `TripCategory`, `Country` → `Region` → `City`, `Activity` (trips, DRAFT/PUBLISHED), `Availability`, `Departure`, `TripSeo`, `FeaturedTag`, `Extra`
- **Commerce**: `Booking`, `Payment`
- **Engagement**: `Review`, `Wishlist`, `Testimonial`, `NewsletterSubscriber`
- **Content**: `Blog` (+ `Author`, `InfoPageCategory` shared content categories), `InfoPage`, `Media`, `Redirect`, `Template`, `TeamDepartment`, `TeamMember`
- **AI**: `GenerationBatch`, `GeneratedItinerary`

Migrations to date: `20260803075159_init`, `20260803082350_extras_templates`, `20260803102919_tenant_scoping`.

## Authentication & authorization

Three independent cookie/session surfaces — all JWT in httpOnly cookies:

| Surface | Middleware | Cookie | Token payload |
|---|---|---|---|
| Tenant staff | `tenant.middleware` | `tenant_auth_token` | `{ staffId, tenantId, email, role }` |
| Platform admin | `admin.middleware` | `admin_auth_token` | admin identity |
| Site users | `userAuth.middleware` | `user_auth_token` | user identity |

- **Tenant scoping**: `tenantMiddleware` requires either a valid `tenant_auth_token` (decodes `{tenantId}` → loads tenant, blocks non-ACTIVE with 403) or an `x-tenant-slug` header for public routes.
- **Staff-or-admin**: `staffMiddleware` passes when `req.staff` is set, otherwise falls back to `adminMiddleware` — endpoints accept either a tenant staff or a platform admin.
- **Route gates**: `/tenant` (signup/login/verify) is public; `/admin` login is public; most `/v1/*` resources sit behind `tenantMiddleware`; AI + activity write routes additionally use `staffMiddleware`.

## API surface (v1)

Major route groups: `users`, `activity`, `blog`, `booking`, `payment`, `wishlist`, `review`, `departure`, `availability`, `departments`, `team`, `country/region/city`, `trip-categories`, `featured`, `media` (+ `media-library`), `generate` (AI), `pdf`, `email`, `newsletter`, `redirect`, `site-config`, `menu`/`footer`/`sidebar-menu`, `page`, `tenant`, `admin`, `stripe`, `author`, `travel-guide`, `testimonial`, `info-pages`.

Notable flows:

- **Tenant signup** (`tenant.controller/signup.ts`): zod-validated, unique-email check, slugify with `-2`/`-3` collision suffix, bcrypt, transactional `Tenant` + `TenantStaff` create, verification email.
- **Tenant verify** (`auth.controller/verifyEmail.ts`): verifies JWT — `id` payload → `User.emailVerified`; `email` payload → tenant activation.
- **Trip publish**: create/update activity schemas **strip `status`** — staff can only create DRAFT. The ONLY status-write path is admin `PATCH /api/v1/admin/approve-listing` (`approveListing.ts`).
- **AI generation** (`generate.controller`): `createBatch` creates a `GenerationBatch` (status `processing`), `submitItem` turns a `GeneratedItinerary` into a DRAFT `Activity` (slug-collision suffix). All routes use `staffMiddleware`.
- **Stripe** (`routes/stripe.route.ts`): `POST /create-checkout-session` (deposit 30% unless `paymentType: "FULL"`), `POST /webhook` (raw body, idempotent by `transactionId`, creates `Booking` on `checkout.session.completed`), `POST /verify-session`.

## Environment

Reference — copy `.env.example` → `.env`:

`NODE_ENV`, `PORT`, `DOMAIN`, `DATABASE_URL`, `JWT_SECRET`, `EMAIL_UNSUB_SECRET`, `JWT_EXPIRY`, `COOKIE_AGE`, `COOKIE_DOMAIN`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VERIFICATION_LINK`, `RESET_LINK`, `FRONTEND_BASE_URL`, `BASE_URL`, `UPLOADS_BASE_URL`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_DISPLAY_NAME`, `CLAUDE_MODEL`.

`.env`, `/dist`, `/data`, `/public/uploads`, `output.json`, `.husky/src` (generated SDK), and `.playwright-mcp` are gitignored.

## Known quirks

- `/upload/local*` endpoints write files only — they create no `Media` DB row (the dashboard uses `/media-library/upload`, which populates `fileSize`).
- `be/data/*.json` (`siteConfig.json`, `menu.json`, `footer.json`, `sidebar-menu.json`) are runtime state written by the dashboard editors — gitignored, not source of truth in git.
