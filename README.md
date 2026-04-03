# Bankes IOM-ITB + OTA-KU — Integrated Monorepo

This repo contains two integrated applications (Bankes IOM-ITB and OTA-KU) sharing a single PostgreSQL database and MinIO object storage, orchestrated via Docker Compose.

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (with Compose v2)
- [Node.js 22+](https://nodejs.org/) _(only needed for local / non-Docker development)_
- [Git](https://git-scm.com/)

---

## Quick Start (Docker — Recommended)

### 1. Clone the repo

```bash
git clone <repo-url>
cd Bankes_OTA-KU_IOM-ITB
```

### 2. Set up environment files

Copy the example env files and fill in real values where needed.

**Root `.env`** (controls VAPID keys, email, and Azure credentials shared by Docker Compose):
```bash
# Already present — edit as needed
# Key variables:
#   VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY  → generate with: npx web-push generate-vapid-keys
#   EMAIL / EMAIL_FROM / EMAIL_PASSWORD   → Gmail / SMTP credentials
#   AZURE_AD_CLIENT_ID/SECRET/TENANT_ID  → only needed for SSO login
```

**Prisma `.env`** (shared database URL used by migration service):
```bash
cp prisma/.env.example prisma/.env
# Default value works out-of-the-box with Docker Compose:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/iom_ota_db"
```

> **Note:** The `OTA-KU/backend/.env` and `OTA-KU/frontend/.env` files are only required for non-Docker local development (see below). Docker Compose injects all environment variables directly.

### 3. Start everything

```bash
docker compose up --build
```

This will:
1. Start **PostgreSQL** and **MinIO**
2. Run **Prisma migrations + seeding** once (the `migrate` service)
3. Start **Bankes IOM-ITB** on [http://localhost:3031](http://localhost:3031)
4. Start **OTA-KU Backend** on [http://localhost:3000](http://localhost:3000)
5. Start **OTA-KU Frontend** on [http://localhost:5173](http://localhost:5173)

> First run may take a few minutes while Docker pulls images and installs npm dependencies.

### Useful commands

```bash
# Run only DB migration + seed (without starting apps)
docker compose up migrate

# View live logs for all services
docker compose logs -f

# View logs for a specific service
docker compose logs -f ota-backend

# Stop all services
docker compose down

# Stop and wipe all volumes (full reset, including DB data)
docker compose down -v
```

---

## Local Development (without Docker)

Use this if you want to run the apps natively with hot-reload outside of containers.

### 1. Start the database

You still need a running PostgreSQL instance. Either:
- Use the Dockerised DB only: `docker compose up postgres minio minio-init`
- Or point to your own local Postgres instance

### 2. Set up the shared database (migration + seed)

```bash
cd prisma
cp .env.example .env        # edit DATABASE_URL if needed
npm install
npx prisma db push
npx prisma db seed
cd ..
```

### 3. OTA-KU Backend

```bash
cd OTA-KU/backend
# Ensure .env is configured (copy values from OTA-KU/backend/.env and adjust)
npm install
npx prisma generate
npm run dev
```

### 4. OTA-KU Frontend

```bash
cd OTA-KU/frontend
# Ensure .env is configured:
#   VITE_APP_URL=http://localhost:5173
#   VITE_API_URL=http://localhost:3000
#   VITE_VAPID_PUBLIC_KEY=<your VAPID public key>
npm install --force
npm run dev
```

### 5. Bankes IOM-ITB

```bash
cd bankes_IOM-ITB
# Ensure .env is configured with DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, and MinIO vars
npm install
npx prisma generate
npm run dev -- -p 3031
```

---

## Environment Variable Reference

### Root `.env` (Docker Compose)

| Variable | Required | Description |
|---|---|---|
| `VAPID_PUBLIC_KEY` | ✅ | Web Push VAPID public key |
| `VAPID_PRIVATE_KEY` | ✅ | Web Push VAPID private key |
| `VAPID_MAILTO` | ✅ | Contact email for VAPID |
| `EMAIL` | ⚠️ | SMTP sender address |
| `EMAIL_FROM` | ⚠️ | Display name for sent emails |
| `EMAIL_PASSWORD` | ⚠️ | SMTP password / app password |
| `AZURE_AD_CLIENT_ID` | ❌ | Azure SSO (optional) |
| `AZURE_AD_CLIENT_SECRET` | ❌ | Azure SSO (optional) |
| `AZURE_AD_TENANT_ID` | ❌ | Azure SSO (optional) |
| `VITE_PUBLIC_URL` | ✅ | Frontend public URL (default: `http://localhost:5173`) |

> ✅ Required &nbsp;⚠️ Needed for email features &nbsp;❌ Optional

### Generating VAPID Keys

```bash
npx web-push generate-vapid-keys
```

Copy the output into the root `.env` and `OTA-KU/frontend/.env`.

---

## Service Ports

| Service | URL |
|---|---|
| Bankes IOM-ITB | http://localhost:3031 |
| OTA-KU Backend | http://localhost:3000 |
| OTA-KU Frontend | http://localhost:5173 |
| PostgreSQL | localhost:5432 |
| MinIO API | http://localhost:9000 |
| MinIO Console | http://localhost:9001 |

**MinIO Console credentials:** `minioadmin` / `minioadmin`

---

## Project Structure

```
.
├── docker-compose.yml        # Main dev orchestration
├── .env                      # Root env vars (VAPID, email, Azure)
├── prisma/                   # Shared Prisma schema + seed scripts
│   ├── schema.prisma
│   ├── seed/
│   └── .env.example
├── bankes_IOM-ITB/           # Bankes Next.js app
└── OTA-KU/
    ├── backend/              # Hono.js REST API
    └── frontend/             # React/Vite frontend
```
