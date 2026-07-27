# Handover — 2026-07-27 (continuing later)

## Goal
Dhanu's personal, private 3D "Dhanu Brain" app (Next.js + React Three Fiber) — a hub-and-rings knowledge graph of every project she builds, with a right-side control panel, project detail modal, Time Machine, and AI Insights. Live at `brain.dkns.ai`. Current task in progress: **lock the whole site behind a single username/password login** — her explicit words: "only log me. i need only one person log to this site... this is my personal site."

## State
Auth system is **written but not yet verified, not committed, not deployed**. Specifically:
- Server-side session (signed cookie via Web Crypto HMAC) — done
- Login page + Server Action — done
- Middleware protecting every route — done
- Logout button wired into the side panel — done
- **Not done yet**: typecheck/lint/build, local login test, writing the three secrets into `.env.local`, git commit+push, and — critically — **the three env vars are not yet set in Vercel**, so the live production site (`brain.dkns.ai`) is currently deployed *without* this auth layer at all (still fully public).

## Key decisions
- **Server-side gate, not client-side.** A client-side "if password matches, show content" check would ship the whole app in the JS bundle regardless — trivially bypassable. Built real middleware + signed cookie instead.
- **No new dependency for signing.** Used the Web Crypto API (`crypto.subtle`, global in both Next.js Middleware's Edge runtime and Node) rather than a JWT library — one fewer thing to install, and it's the only crypto API guaranteed available in Edge middleware.
- **Fail closed.** If `AUTH_SECRET`/`AUTH_USERNAME`/`AUTH_PASSWORD` are unset, `verifySessionToken` returns `false` and the login action returns `"Login is not configured yet."` — i.e. if she deploys this code before setting the env vars, the site becomes inaccessible to everyone (safe default) rather than accidentally open.
- **Repo is public** (`dhanu-af/Brain-v2` on GitHub, confirmed via `gh api`). This is *why* credentials must live only in env vars, never hardcoded — anything in source is world-readable.
- **Simple string comparison for the password check**, not timing-safe comparison. Deliberate tradeoff: this is a single-user personal hobby gate, not a high-value target; added complexity wasn't worth it here.
- Generated credentials myself (see below) rather than asking her to invent one mid-flow, since she needs something to actually type in — she can change any of the three via Vercel env vars at any time, no code change required.

## Files touched
- `src/lib/session.ts` — **new**. `createSessionToken()` / `verifySessionToken(token)`, HMAC-SHA256 over an expiry timestamp, 30-day expiry. Also exports `SESSION_COOKIE = "brain_session"` (kept here, not in `auth-actions.ts`, because a `"use server"` file can only export async functions — a plain string const would break the build if exported from there).
- `src/lib/auth-actions.ts` — **new**, `"use server"`. Exports `login(prevState, formData)` (validates against `process.env.AUTH_USERNAME`/`AUTH_PASSWORD`, sets the HttpOnly/Secure/SameSite=Lax cookie, redirects to `/`) and `logout()` (deletes cookie, redirects to `/login`).
- `src/app/login/page.tsx` — **new**. Client component, `useActionState(login, {})`, dark-glass form matching the app's existing look.
- `src/middleware.ts` — **new**. Redirects to `/login` for any request without a valid session cookie; matcher excludes `_next/static`, `_next/image`, `favicon.ico`. `/login` itself is explicitly let through inside the function body.
- `src/components/panel/SidePanel.tsx` — **modified**, not yet committed. Added a "Log out" button next to the existing "AI Insights" button in the panel header, wired directly to the `logout` server action via a `<form action={logout}>`.

## Gotchas / constraints learned
- `"use server"` files in Next.js can only export async functions — tried putting `SESSION_COOKIE` in `auth-actions.ts` first, moved it to `session.ts` instead.
- `.env.local` in this repo already contains a `VERCEL_OIDC_TOKEN` (written by an earlier `vercel link` run) — it's real but short-lived/dev-scoped, and the file is confirmed gitignored (`.env*` in `.gitignore`). Append the new auth vars to it, don't overwrite the file.
- **The live `brain` Vercel project is not git-connected for auto-deploy.** Every successful deploy so far (including the current live Dhanu Brain rebrand) went through `mcp__vercel__deploy_to_vercel` as a direct file upload, not a git push — a git push to `dhanu-af/Brain-v2` does **not** update `brain.dkns.ai` by itself. See "Next steps" — deploying this auth change requires the same direct-deploy path (or her manually reconnecting Git in the Vercel dashboard first, which was left undone last session due to a cross-account permission error).
- Vercel project id `prj_O2pOiSGhp6qdIdsdGEdK7YkFLFqj`, team `team_IFsD28fF0XXuFVwrVhrnLXnX` (slug `dkns1`, display name "DKNS"). Live aliases: `brain.dkns.ai`, `brain-eight-alpha.vercel.app`, `brain-dkns1.vercel.app`, `brain-dhanu-9494-dkns1.vercel.app`.
- Generated secrets this session (not yet written anywhere except this doc and the terminal output already shown to Dhanu):
  - `AUTH_SECRET=75f97e3d8332ae53b8eed2aeb201f3ede4fc99d2860ddf3dec6e4ae74cc43823a1f896bc17200bda53e62b6a5c8de4e1`
  - `AUTH_PASSWORD=tidal-coral-quartz-6686`
  - `AUTH_USERNAME` was suggested as `dhanu` but never confirmed with her — ask, or just use it.

## Next steps
1. Append the three vars above to `.env.local` (create if needed) and run `npm run dev` to test the login flow locally end-to-end (login redirects to `/`, wrong password shows the error, logout returns to `/login`, direct visit to `/` while logged out redirects to `/login`).
2. `npx tsc --noEmit` and `npx eslint .` — neither has been run since these files were added.
3. `npm run build` — confirm it succeeds (Server Actions + Middleware both need to compile cleanly under Next 16/Turbopack).
4. `git add -A && git commit` (exclude nothing — `.env.local` is already gitignored) and `git push origin main` to `dhanu-af/Brain-v2`.
5. Tell Dhanu the three exact key/value pairs to paste into **Vercel dashboard → brain project → Settings → Environment Variables** (Production at minimum) — `AUTH_USERNAME`, `AUTH_PASSWORD`, `AUTH_SECRET` from above (or whatever she wants to change them to).
6. Once she confirms the env vars are set, redeploy via the same `mcp__vercel__deploy_to_vercel` direct-upload path used last session (see prior conversation for the exact file list/content — everything needed is already in the working tree, nothing new to reconstruct) targeting `name: "brain"`, `teamId: "team_IFsD28fF0XXuFVwrVhrnLXnX"`.
7. Verify live: `curl -s -o /dev/null -w "%{http_code}" https://brain.dkns.ai/` should now redirect (or return the login page), not the app directly.

## Open questions
- Does she want `AUTH_USERNAME` to be `dhanu`, or something else?
- Does she want the generated password kept, or replaced with one of her own choosing?
- No multi-device/session-revocation concern raised — current design is one shared password, 30-day cookie, no per-device tracking. Fine unless she asks for more later.
