---
name: workflow
description: "Full TDD orchestrator — runs the complete spec → implement → verify cycle for any target"
user_invocable: true
argument: "<target> — module name, component name, or feature name"
---

# /workflow — Full TDD Orchestrator

You are the **main entry point** for all development work on this project. The user gives you a target and you orchestrate the full TDD cycle.

## Context Loading

Before doing anything, read `CLAUDE.md` to load:
- **Project spec path** — from the "Project Spec" section
- **Tech stack** — from the "Tech Stack" table
- **Commands** — from the "Commands" table
- **Architecture** — from the "Architecture" table
- **Module Dependency Chain** — from the "Module Dependency Chain" section
- **Conventions** — from the "Conventions" section

## Step 1: Understand the Target

Read the project spec document (path from CLAUDE.md) to understand the target's requirements and expected behavior.

## Step 2: Classify the Target

Determine the type of work:

| Type | How to Identify | Process |
|------|----------------|---------|
| **Foundation** | Matches `/bootstrap` or a module in the dependency chain | Run the matching skill |
| **Server module** | Server-side logic with testable behavior | spec → implement → run tests |
| **UI component** | Frontend UI component | build component → type check |
| **Communication + state** | Wiring server events to client state | wire protocol + state → E2E tests |
| **Verify** | `check-*` prefix — visual/browser checking | browser verification |

## Step 3: Execute the Appropriate Cycle

### For Server Modules

1. **RED phase** — Write failing tests:
   - Read the project spec for the module's rules and behavior
   - Check existing tests with `Glob` to avoid duplication (look in test directories per Architecture section)
   - Create test file following patterns from `spec/references/unit-test-pattern.md`
   - Cover: happy path, edge cases, error conditions, boundary values
   - Run tests using the unit test command from CLAUDE.md Commands to confirm they FAIL

2. **GREEN phase** — Implement to pass tests:
   - Read the test file to understand expected behavior
   - Find and read project type definitions (check with `Glob` for `**/types.ts`)
   - Check existing code structure with `Glob` to determine the correct directory
   - Follow patterns from `implement/references/code-conventions.md`
   - Run tests iteratively until ALL pass
   - Run full test suite (from CLAUDE.md Commands) to check regressions

3. **Report** — Summarize: tests written, tests passing, files created

### For UI Components

1. Read the project spec for UI requirements
2. Check existing E2E specs for expected `data-testid` attributes
3. Create component following `component/references/component-pattern.md`
4. Read CLAUDE.md Tech Stack for animation library, styling framework, state management
5. Ensure responsive design (mobile/tablet/desktop)
6. All interactive elements get `data-testid`
7. Run type check command from CLAUDE.md Commands
8. Report: files created, testids added

### For Communication + State Integration

1. Read the project spec for the communication event contract (location from CLAUDE.md "Event Contract")
2. Read existing integration code (check Architecture section for handler/client/store directories)
3. Wire server handler, client, and state store
4. Write E2E tests for the round-trip flow
5. Run E2E tests using command from CLAUDE.md Commands
6. Report: events wired, tests passing

### For Verify (check-* targets)

1. Start dev server if not running (use dev command from CLAUDE.md Commands)
2. Use Chrome browser automation tools to navigate and interact
3. Test responsive at 3 viewports: desktop (1280x720), tablet (768x1024), mobile (375x667)
4. Screenshot key states
5. Create GIF recordings of user flows when useful
6. Report: screenshots taken, issues found

## Rules

- ALWAYS read CLAUDE.md first to load project context
- ALWAYS read the project spec — it is the source of truth
- NEVER skip the RED phase for server modules — tests must fail first
- NEVER modify test files during the GREEN phase
- Run the full test suite after implementation to catch regressions
- Report a clear summary at the end
