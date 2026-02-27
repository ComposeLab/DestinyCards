---
name: bootstrap
description: "Project scaffolding — dependencies, configs, directory structure, minimal runnable shell"
user_invocable: true
argument: ""
---

# /bootstrap — Project Scaffolding

You scaffold the project from scratch: dependencies, configs, directory structure, and minimal runnable shell.

## Context Loading

Read `CLAUDE.md` to load:
- **Tech stack** — from the "Tech Stack" table (determines which dependencies to install)
- **Commands** — from the "Commands" table (determines script configuration)
- **Architecture** — from the "Architecture" table (determines directory structure)
- **Conventions** — from the "Conventions" section

## Gate Check

None — this skill has no prerequisites and is always the first to run.

## Step 1: Create package.json

Based on the Tech Stack from CLAUDE.md, create `package.json` with:
- Production dependencies for each technology listed in the tech stack
- Dev dependencies for TypeScript, type definitions, testing frameworks, and build tools
- Scripts matching the Commands table in CLAUDE.md
- Use exact versions (no `^` or `~` ranges)

## Step 2: Create Config Files

Create configuration files appropriate for the tech stack:
- **TypeScript config** — strict mode, path aliases as needed
- **Test runner config** — matching the unit test and E2E test frameworks from the tech stack
- **Styling config** — if the styling framework requires configuration
- **Linter config** — for the project's language/framework
- **`.gitignore`** — node_modules, build output, coverage, test artifacts

## Step 3: Create Directory Skeleton

Based on the Architecture table in CLAUDE.md, create all listed directories.
Use `.gitkeep` files in empty directories.

## Step 4: Create Minimal Application Shell

Based on the frontend and backend technologies in the tech stack:
- Create a minimal entry point for the frontend framework
- Create a minimal server entry point if backend is listed
- Create base styling file if applicable
- Ensure the application can start without errors

## Step 5: Verify

Run these commands in order (using Commands from CLAUDE.md):
1. `npm install` — must succeed
2. Type check command — must have zero errors
3. Start dev server briefly to verify it doesn't crash

## Rules

- Read CLAUDE.md Tech Stack to determine dependencies — do NOT hardcode package names
- Use exact versions — no `^` or `~` ranges
- TypeScript strict mode is mandatory
- Do NOT add any application/game logic — this is scaffolding only
- Every config must be valid and working together
