# VIRALSTORY AI

A mobile-first English and Kiswahili short-story platform. This repository currently contains a small Next.js App Router foundation; public video playback, the private studio, authentication, persistence, AI providers, and rendering are not implemented yet.

## Requirements

- Node.js 20.9 or newer (LTS recommended)
- npm 10 or newer
- Git

Check installed versions with `node --version` and `npm --version`.

## First-time setup

Run these commands from a terminal:

```bash
git clone https://github.com/coolmusictz/Viral-Story.git
cd Viral-Story
npm install
cp .env.example .env.local
npm run dev
```

What they do:

1. `git clone ...` downloads the repository to your computer.
2. `cd Viral-Story` enters the project directory.
3. `npm install` resolves and installs the dependencies listed in `package.json`.
4. `cp .env.example .env.local` creates your ignored local environment file. There are no real credentials in the example. Edit it only if local configuration is needed; do not commit secrets. In PowerShell, use `Copy-Item .env.example .env.local` instead.
5. `npm run dev` starts the local Next.js development server. Open the URL printed in your terminal, usually `http://localhost:3000`.

Stop the server with `Ctrl+C`.

## Routes

- `/` — starter landing page
- `/health` — application scaffold health page (does not check external services)

## Quality checks

Run each from the project directory:

- `npm run lint` — ESLint checks the project and fails on warnings.
- `npm run typecheck` — TypeScript checks types without emitting files.
- `npm test` — runs unit tests with Vitest.
- `npm run format:check` — checks formatting with Prettier.
- `npm run build` — creates the production build.
- `npm start` — serves the production build after `npm run build`.
- `npm run format` — formats supported project files.

## Project structure

```text
app/                 App Router layouts and routes
  health/            Health status page
components/          Reusable UI components
lib/                 Shared, framework-light logic
server/services/     Server-only service integration boundary
tests/               Unit tests
types/               Shared TypeScript data types
```

## Configuration and security

- `.env.example` contains placeholders only. `.env.local` and other `.env*` files are ignored by Git; `.env.example` is intentionally tracked.
- Keep provider keys and database credentials on the server. Never prefix secrets with `NEXT_PUBLIC_`.
- External services are intentionally not wired up. Do not treat the health page as a database/provider readiness check.
- Future factual story generation must retain source links and verification status; human approval must gate publication.
- Long-running rendering and media operations should use a worker/job system rather than a normal web request.

## First commit (if you are initializing a local clone)

The scaffold files are present on the repository's `main` branch. If you have made additional local changes you want to commit, inspect them first with `git status` and `git diff`, then use:

```bash
git add .
git commit -m "Scaffold Next.js app foundation"
git push origin main
```

Do not run `git add .` if your working tree contains unrelated or secret files; stage only the intended paths instead.
