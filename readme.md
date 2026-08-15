# Ash and Moss — E-commerce Backend

Express 5 + TypeScript + Prisma 7 (PostgreSQL) API for the Ash & Moss furniture store. Serves the **admin dashboard** (`dash.ashandmoss.com`) and the **storefront** (`ashandmoss.com`).

## Tech stack

- **Express 5** (async handlers via `express-async-handler`)
- **Prisma 7** (`prisma-client-js` generator, `@prisma/adapter-pg`, `prisma.config.ts` `defineConfig` pattern)
- **PostgreSQL** (via `pg`)
- **Auth**: JWT (httpOnly cookies) — platform admins, authors, and site users
- **Validation**: zod 4
- **Payments**: NCHL connectIPS (NPR gateway; frontend checkout currently places orders without payment)
- **Email**: nodemailer (SMTP via `SMTP_USER`/`SMTP_PASS`), templated order-confirmed + newsletter emails
- **Misc**: multer + sharp (image upload), pdfkit (invoice PDFs), winston (logging), helmet, cors, express-rate-limit, swagger-jsdoc (spec at `/api-docs`)

## Getting started

1. Install: `pnpm install` (pnpm 10, `packageManager: pnpm@10.31.0`)
2. Copy `.env.example` → `.env` and fill values (see [Environment](#environment))
3. `npx prisma migrate deploy` — apply `prisma/migrations/`
4. Seed:
   - `pnpm seed:admin` — platform admin + categories
   - `pnpm seed` — full store seed (products, brands, info pages, site config)
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
├── middlewares/              # auth + error handling
├── routes/                   # route definitions (JSDoc drives Swagger spec)
├── services/                 # pdfkit invoice generation, site-config helpers
├── seeder/                   # seed.ts, admin.seed.ts
├── utils/                    # email templates, slugify, price, etc.
├── validations/              # zod schemas
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

- **Commerce**: `Brand`, `Category`, `Product` (+ `ProductVariant`, `ProductImage`, attributes, FAQs), `Order`, `Payment`, `Wishlist`
- **Admin**: `Admin`, `User`, `Author`
- **Engagement**: `Review`, `Testimonial`, `NewsletterSubscriber`
- **Content**: `Blog`, `InfoPage`, `Media` (media library), `Redirect`, `Menu`/`Footer`/`SidebarMenu`, `SiteConfig` (store settings)

> Note: e-commerce tables are synced with `prisma db push` (the committed migrations only cover an earlier template schema).

## Authentication & authorization

JWT in httpOnly cookies:

| Surface | Middleware | Cookie |
|---|---|---|
| Platform admin | `admin.middleware` | `admin_auth_token` |
| Authors | `author.middleware` | `author_auth_token` |
| Site users | `userAuth.middleware` | `user_auth_token` |

Route gates: `/admin` login is public; storefront-facing routes (`/products`, `/site-config`, etc.) are public; admin/author write routes sit behind their respective middlewares.

## API surface (v1)

Major route groups: `users`, `admin`, `products`, `categories`, `brands`, `tags`, `variants`, `orders`, `payments`, `reviews`, `authors`, `blogs`, `media` (+ `media-library`), `menus`, `pages`, `redirects`, `site-config`, `sidebar-menu`, `testimonials`, `footers`, `info-page`, `newsletter`, `wishlist`, `email`, `pdf` (order invoices), `logout`, `verify`, `forget-password`, `reset-password`.

Notable flows:

- **Orders** (`order.controller`): create order from cart with stock reservation, admin list/update status, invoice PDF via pdfkit.
- **Payments**: connectIPS integration (`lib/connectips.ts`); the storefront checkout currently places orders without a payment step.
- **Media library**: multer + sharp uploads served from `public/uploads`, metadata stored in `Media`.

## Environment

Reference — copy `.env.example` → `.env`:

`NODE_ENV`, `PORT`, `DOMAIN`, `DATABASE_URL`, `JWT_SECRET`, `EMAIL_UNSUB_SECRET`, `ENCRYPTION_KEY`, `JWT_EXPIRY`, `COOKIE_AGE`, `COOKIE_DOMAIN`, `VERIFICATION_TOKEN`, `VERIFICATION_LINK`, `RESET_LINK`, `FRONTEND_BASE_URL`, `BASE_URL`, `UPLOADS_BASE_URL`, `EMAIL_DISPLAY_NAME`, `EMAIL_FROM`, `SMTP_*`, `CONNECTIPS_*` (base URL, merchant/app ids, password, private key, success/failure URLs).

`.env`, `/dist`, `/data`, `/public/uploads`, `output.json`, `.husky/src` (generated SDK), and `.playwright-mcp` are gitignored.

## Known quirks

- `/upload/local*` endpoints write files only — they create no `Media` DB row (the dashboard uses `/media-library/upload`, which populates `fileSize`).
- `data/*.json` (`siteConfig.json`, `menu.json`, `footer.json`, `sidebar-menu.json`) are runtime state written by the dashboard editors — gitignored, not source of truth in git.
