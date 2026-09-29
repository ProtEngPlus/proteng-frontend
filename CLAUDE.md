# protengplus-frontend

Web client of ProtEngPlus (React, TypeScript, Vite, Tailwind, MUI). It talks only to proteng-bff through `src/commons/api/`. The default branch is `dev`.

**This repo is public.** Never add IPs, hostnames of the deploy machines, runbooks or any credential. `VITE_*` values are baked into the JavaScript bundle at build time, so they must never hold secrets.

## Commands

- Before finishing any change: `npm run format:check && npm run lint && npm run build` (the pre-push hook runs the same; CI runs format check and lint).
- `npm run dev` on http://localhost:5173 needs bff on http://localhost:8080. `npm run format` and `npm run lint:fix` apply fixes.
- There is no Makefile in this repo on purpose; npm scripts are the interface.

## Code layout

- `src/pages/<Page>/` one folder per page; page-only components live under it. Shared components are in `src/commons/components/`.
- `src/routes/router.tsx` routes. `src/commons/api/` calls to bff. `src/commons/interfaces/` API types. `src/commons/hooks/useAuth.ts` and `src/commons/providers/AuthProvider.tsx` auth state.
- `src/commons/configs/createJobConfig.ts` defines the pipeline steps, tools and their parameters; the Create Job form is generated from it. See `docs/pipeline-config.md`.

## Things that break

- Tool names are lowercased and sent as the job's tool; conductor builds the RabbitMQ routing key `<stage>.<tool>` from them. A tool name that no ML service listens for makes the job hang silently.
- `percent` parameters render as percentage inputs; do not use them for non-percentage fields (BLB2 is an existing case).
- `VITE_*` changes need a restart of the dev server; dev and production get them from `build-args` in `.github/workflows/build-push.yaml`.
- Markdown is formatted by prettier on commit; write docs so `prettier --check` passes.
- A push to `dev` deploys dev and a push to `main` deploys production, even for docs-only changes.

## Team workflow

Issue first with a commit plan, branch from `dev`, Conventional Commits in English with one topic per commit, PR into `dev` using the template in Thai, no emoji anywhere. Full rules: `CONTRIBUTING.md` of manual-guides-2023.
