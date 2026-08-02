# Handover — 2026-08-01 16:00

## Goal
Dhanu's personal, private 3D "Dhanu Brain" project-launcher app (Next.js 16 +
React Three Fiber), live at `brain.dkns.ai`. This session covered three
separate efforts on top of the already-shipped login gate: (1) a cinematic
"AI OS" visual redesign of the 3D graph, (2) several rounds of catalog
updates to `src/data/projects.json` to keep it matching her real projects,
and (3) diagnosing and fixing a broken Vercel↔GitHub auto-deploy pipeline.

## State
Everything is committed, pushed, and **live**. Working tree clean, `main` up
to date with `origin/main`. Git auto-deploy is confirmed working again
(verified via a real test commit + deployment after the fix below) — a
normal `git push` is now sufficient to ship changes, no manual steps needed.

### Cinematic redesign (8 phases, all shipped)
Built from an approved plan (`C:\Users\dnand\.claude\plans\dreamy-zooming-narwhal.md`)
after Dhanu's original spec included fictional placeholder nodes (Tourism,
Hotels, CRM, ERP, etc.) that don't correspond to real projects — resolved by
using her actual project catalog instead, and status-based coloring
(Live/Development/Testing/Archived) instead of the spec's conflicting
category-based legend.
1. Deep-space background: `#050505` everywhere, 3-layer starfield (`ParticleField.tsx`)
2. Bloom post-processing (`@react-three/postprocessing`, tuned threshold 0.18) + reactor rings on the hub
3. Animated "energy" points traveling along hub-links only (`GraphEdges.tsx`'s `EdgeEnergy`)
4. Hover highlights connected nodes/edges, dims the rest
5. Floating top-center `SearchBar.tsx` (side panel's own search box kept, both share state)
6. `ProjectModal.tsx` restyled from centered popup → right-docked sliding glass panel
7. `LeftControlsPanel.tsx`: toggles for Show Links / Physics / Auto Rotate / Glow / Particles (Dark Mode is an intentionally-disabled placeholder — app is dark-only by design)
8. Bottom-center `Legend.tsx`

### Post-redesign fixes (from Dhanu's feedback after seeing it live)
- Clicking a node used to fly the camera in tight (same as search). Now decoupled: `Scene`'s `focusedProjectId` prop is search-only (drives camera), a separate `selectedProjectId` prop just highlights the clicked node without moving the camera — "click stays at normal zoom."
- `LeftControlsPanel` got the same collapse/expand handle the side panel already had (mirrored to the right edge since it's docked left).
- `Legend` pills are now clickable status filters — click "Live" to dim everything non-Live; click the active one again to clear.

### Catalog (`src/data/projects.json`) — 14 projects now
Corrected/added this session: DKNS Digital (added real domain+favicon+Live
status), Nanduni (was stale "Agri-Econ" sandbox description, now reflects
its real deployed graduation-portrait site), VillageRide (added, then
corrected from tech-stack-guesswork to its real description from memory —
ride-hailing + goods delivery for village taxi associations — plus its new
`vrides.net` domain), Dhanu AI (added), **NutriAI (added — see caveat
below)**.

## Key decisions
- **Real projects only, no fictional nodes.** Dhanu's original cinematic-redesign spec listed generic placeholder nodes (Tourism/Hotels/CRM/ERP/Maps/etc.) mixed with real ones. Confirmed with her to use only the real 13→14 project catalog.
- **Status-based node coloring kept, not category-based.** Her spec's legend (Green=Active/Orange=Planning/Blue=AI/Purple=Research) mixed two incompatible schemes; nodes are colored by `getStatusColor` (status), so the legend matches that instead of forcing a recolor.
- **Skipped `react-force-graph`, `leva`, GSAP, `@react-spring/three`** even though her spec named them — `react-force-graph` manages its own renderer (doesn't compose inside an existing R3F `<Canvas>`), `leva` is a dev-debug UI not a production control panel, and Framer Motion (already installed) covers the animation needs GSAP/react-spring would duplicate. Only added `@react-three/postprocessing` (verified peer-dep compatible: react ^19, three >=0.156, fiber ^9).
- **Camera fly-to is now search-only, not click-driven** — direct user feedback after seeing the live redesign ("i need to click one and go to normal mode").
- **NutriAI's tech stack is deliberately left blank in the catalog.** Its GitHub repo (`khdanushka-spec/nutriai`) is completely empty (no commits, confirmed via `gh api repos/.../commits` returning "Git Repository is empty") despite Vercel showing a real deployed build — so there was nothing to verify a tech stack against. Description comes from the Vercel deploy's commit message, which is real text, not a guess.

## Files touched
Redesign: `src/components/graph/{Scene,GraphEdges,GraphNode,HubNode,OrbitRings(new),ParticleField,CameraRig}.tsx`, `src/components/{SearchBar,LeftControlsPanel,Legend}.tsx` (all new), `src/components/UniverseApp.tsx`, `src/components/modal/ProjectModal.tsx`, `src/components/icons.tsx` (added Chevron icons), `src/lib/types.ts` (added `TIER_RING_RADII` export), `src/app/globals.css` + `src/app/login/page.tsx` (background color), `package.json` (+`@react-three/postprocessing`, `+postprocessing`).
Catalog: `src/data/projects.json`.
No files are mid-edit — every phase/fix was independently typechecked, linted, built, committed, and pushed.

## Gotchas / constraints learned
- **This session's Browser pane could not render/screenshot the WebGL canvas at all** — `innerWidth`/`innerHeight` reported 0 for most of the session (briefly worked once, canvas still stuck at default 300×150 either way). All 8 redesign phases were shipped verified only by typecheck/lint/build, not visual inspection — Dhanu did the actual visual QA live. If a fresh session hits the same issue, don't burn time retrying it; rely on code review + her feedback instead.
- **The Vercel↔GitHub auto-deploy integration silently broke mid-session** — two consecutive pushes (`850a01e`, `d4e623a`) produced zero deployment records on GitHub's own deployments API (`gh api repos/dhanu-af/Brain-v2/deployments`), not just a Vercel-side delay. A dashboard-side disconnect/reconnect of the Git integration (Vercel → brain project → Settings → Git) did **not** fix it. What fixed it: Dhanu re-authorizing the Vercel GitHub App from **GitHub's** side (Settings → Applications → Authorized GitHub Apps), confirmed working via a real test commit that showed up in both `gh api .../deployments` and `mcp__vercel__list_deployments`. If this breaks again, check GitHub's deployments API first (fast, no ambiguity) before assuming it's just slow.
- **Direct-upload deploy (`mcp__vercel__deploy_to_vercel`) is a working fallback** when Git integration is down — used successfully once this session to ship NutriAI + the 3 post-redesign fixes while the webhook was broken. Needed the full current file tree (read fresh off disk, not from stale conversation context) since it's a stateless full replace, not a diff.
- **Windows Git Credential Manager keeps caching the wrong GitHub identity** (`khdanushka-spec` instead of `dhanu-af`) and silently breaks `git push` with a 403. Fix each time: `git credential-manager github logout khdanushka-spec && gh auth setup-git` (gh CLI itself stays correctly authenticated as `dhanu-af` throughout — it's specifically git's credential helper that drifts).
- Vercel project: `prj_O2pOiSGhp6qdIdsdGEdK7YkFLFqj`, team `team_IFsD28fF0XXuFVwrVhrnLXnX` (slug `dkns1`). GitHub repo: `dhanu-af/Brain-v2` (there is also a stale, unrelated `dhanu-af/Brain` repo from before the rebuild — don't confuse the two, `Brain-v2` is correct).

## Next steps
Nothing outstanding — this was a "ship and verify" session, not a "left mid-task" one. If Dhanu comes back with more visual feedback on the redesign (bloom intensity, panel positions/collisions on her screen size, etc.), that's the natural next thread — she was asked to report back after seeing it live but hadn't yet as of this handover.

## Open questions
- Does Dhanu want the bloom intensity or any panel positioning adjusted once she's spent more time with the live cinematic redesign?
- NutriAI's real tech stack is still unconfirmed (repo is empty) — if she ever pushes real code to `khdanushka-spec/nutriai`, the catalog entry should be revisited.
