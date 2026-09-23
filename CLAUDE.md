# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Mario Kart World tournament randomizer: a single-page React app embedded in a Jekyll static site, deployed to GitHub Pages at https://pcalderw.github.io/mk_world_randomizer/. It randomizes racer/kart loadouts per player and steps players through 4 races, presenting pairs of course choices (avoiding recent repeats) that the group votes on.

## Commands

- `npm run serve` — local dev: runs `vite build --watch` and `bundle exec jekyll serve` concurrently. This is the normal way to develop (there is no Vite dev server / HMR setup for the Jekyll-served pages — `src/index.html` is a standalone hot-reload sandbox not used in production).
- `npm run build` — full production build: `vite build` (React → `assets/react-dist/`) then `bundle exec jekyll build` (→ `_site/`). Order matters: Jekyll includes the compiled `assets/react-dist` output, and `_config.yml` excludes `src/` from Jekyll processing entirely.
- `npm run build:react` — Vite build only.
- `npm run build:jekyll` — Jekyll build only (expects `assets/react-dist` to already exist from a React build).
- `npx eslint .` — lint (flat config in `eslint.config.mjs`, covers js/jsx/json/md/css).
- There is no test suite (`npm test` is a placeholder that exits with an error).
- Ruby/Jekyll deps are managed via Bundler (`Gemfile`/`Gemfile.lock`); run `bundle install` if Jekyll commands fail with missing gems.

CI (`.github/workflows/deploy.yml`) on push to `main`: `npm ci` → `vite build` → `bundle exec jekyll build` → deploy to GitHub Pages.

## Architecture

**Two build systems glued together.** Jekyll owns the site shell (layouts in `_layouts/`, includes in `_includes/`, page content in `index.markdown`), while Vite/React owns the actual application. `vite.config.js` sets `root: 'src'`, builds `src/main.jsx` as the entry, and emits fixed-name output (`assets/react-dist/assets/main.js`/`.css`) so `index.markdown` can reference stable filenames. `assets/react-dist/**` is committed to the repo (not gitignored) since Jekyll's build step consumes it directly — regenerate it with `npm run build:react` before a Jekyll-only build/commit.

**React app root:** `src/main.jsx` mounts `App.jsx` into `<div id="root">` (defined in `index.markdown`, injected into `_layouts/default.html`).

**State management is a hand-rolled singleton store, not Redux/Context:**
- `src/TournamentManager.js` exports a single `tournamentManager` instance holding all in-memory tournament state (players, per-race course options, selections) and an observer-pattern `subscribe`/listener mechanism.
- `App.jsx` reads it via React's `useSyncExternalStore(tournamentManager.subscribe, tournamentManager.getCurrentTournament)` — this is the only bridge between the store and React; components never hold tournament state themselves, they call methods on `tournamentManager` (e.g. `rerollRacers`, `selectCourse`, `reset`) and re-render off the store's notifications.
- Tournaments are hardcoded to 4 races (`TournamentManager` has a comment noting this could become configurable).
- The in-progress tournament is persisted to `localStorage` after every mutation (`#updateSubscribers` calls `repo.saveInProgress`), and `begin()`/`#tryResume()` restores it on load so a page refresh mid-tournament doesn't lose state. `reset()` and `end()` clear the saved tournament.

**Persistence:** `src/CourseRepo.js` wraps `localStorage` to track which courses were recently presented/selected (so `Randomizer.js` can avoid repeats) and to save/restore the in-progress tournament (`getInProgress`/`saveInProgress`/`clearInProgress`).

**Randomization logic:** `src/Randomizer.js` has pure functions (`randomizeKart`, `randomizeRacer`, `randomizeCoursePair`) that pick from the static data in `src/constants/{courses,karts,racers}.json`, filtering course picks against recent history. `src/constants/*.json.rng` files are stale duplicate copies of the `.json` data (not schemas, not referenced anywhere) — safe to ignore.

**Course connectors:** each course entry in `courses.json` has a `connectors` array of other course IDs it can be chained into. `TournamentManager#randomizeNextSelections` checks whether the two randomly-picked courses connect to each other and shapes the race option (`course1`/`connector1`/`course2`/`connector2`) accordingly. The UI (`TournamentTable.jsx`) renders a connected pair as a single diagonal-split image (`DiagonalSplitImage`) instead of two separate choices, and a self-connector pair (same course picked as connector of itself) collapses to one auto-selected option.

**UI layer:** `App.jsx` composes `PlayersTable`/`RacesTable` (both in `src/TournamentTable.jsx`) and `DeleteConfirmButton.jsx`, built on MUI (`@mui/material`, `@mui/icons-material`). `DeleteConfirmButton` clears the "recent courses" localStorage history (via `tournamentManager.clearRecentHistory()`) so previously-seen tracks can reappear sooner.
