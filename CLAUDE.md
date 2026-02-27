# DestinyCards — 3-Card Poker (Teen Patti)

## Overview
Real-time multiplayer browser card game.

## Project Spec
`GAME_IDEA.md`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router), React |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS (responsive: sm/md/lg breakpoints) |
| Animations | GSAP |
| State Management | Zustand |
| Backend | Express, Node.js |
| Realtime | Socket.IO |
| Audio | Howler.js |
| Effects | canvas-confetti |
| Unit Tests | Vitest |
| E2E Tests | Playwright |

## Commands

| Action | Command |
|--------|---------|
| Dev server | `npm run dev` |
| Unit tests (all) | `npm test` |
| Unit tests (file) | `npx vitest run <path>` |
| E2E tests (all) | `npx playwright test` |
| E2E tests (file) | `npx playwright test <path>` |
| Type check | `npx tsc --noEmit` |

## Architecture

| Directory | Purpose |
|-----------|---------|
| `server/game/` | Game engine, hand evaluator, validators, deck |
| `server/socket/handlers/` | Socket.IO event handlers |
| `server/state/` | Room manager, history store, types |
| `server/utils/` | Constants, ID generator |
| `server/__tests__/` | Server-side unit tests |
| `src/app/` | Next.js pages (App Router) |
| `src/components/` | React UI components (game/, lobby/, history/, ui/) |
| `src/hooks/` | Custom React hooks |
| `src/stores/` | Zustand state stores |
| `src/lib/` | Client utilities, types, socket client |
| `e2e/` | Playwright E2E test specs |
| `public/` | Static assets (sounds, cards, images) |

## Module Dependency Chain

```
bootstrap → core ─┬→ engine ─┬→ bots
                   └→ state  ─┘
```

- `core` — Types, utils, deck
- `engine` — Hand evaluator, validators, game engine, round-end
- `state` — Room manager, history store
- `bots` — Bot AI, bot manager

`engine` and `state` can run in parallel after `core`.

## Conventions

- TypeScript strict mode — no `any` types
- All animations use GSAP (not Framer Motion or CSS transitions for complex animations)
- Tailwind CSS for all styling — no inline styles or CSS modules
- Zustand for client state management — use selectors, not full store
- All interactive elements need `data-testid` attributes
- Server game logic: pure functions, authoritative server model
- Communication events follow contract defined in project spec (`GAME_IDEA.md`)

## Event Contract
The communication protocol (Socket.IO events) is defined in the project spec file (`GAME_IDEA.md`), section "Socket Events".

## Development Workflow — TDD
1. Write specs FIRST (`/spec` or `/workflow`)
2. Implement to pass specs (`/implement` or `/workflow`)
3. Verify visually (`/check-ui` or `/workflow`)

## Skills
- `/workflow <target>` — Full TDD cycle (main entry point)
- `/spec <module>` — Write failing tests
- `/implement <module>` — Code to pass tests
- `/component <name>` — Build UI component
- `/integrate <feature>` — Wire communication + state
- `/check-ui <area>` — Visual browser verification
- `/bootstrap` — Project scaffolding (configs, deps, directory structure)
- `/build <module>` — Build a module (spec + implement cycle)
