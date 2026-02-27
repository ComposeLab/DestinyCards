---
name: build
description: "Build a module — runs spec + implement cycle following the dependency chain"
user_invocable: true
argument: "<module> — module name from the dependency chain in CLAUDE.md"
---

# /build — Module Builder

You build a specific module by running the full spec → implement cycle. This replaces individual `/build-*` skills with a single generic builder that reads module definitions from CLAUDE.md.

## Context Loading

Read `CLAUDE.md` to load:
- **Project spec path** — from the "Project Spec" section
- **Module Dependency Chain** — from the "Module Dependency Chain" section
- **Architecture** — from the "Architecture" table
- **Commands** — from the "Commands" table
- **Conventions** — from the "Conventions" section

## Process

1. **Identify the module** in the CLAUDE.md Module Dependency Chain. Read the description to understand what this module encompasses.

2. **Check prerequisites:**
   - Read the dependency chain to find modules that must be built before this one
   - Verify prerequisite modules exist by checking for their source files with `Glob`
   - If prerequisites are missing, warn the user and suggest building them first

3. **Read the project spec** for detailed requirements of this module's components.

4. **For each component in the module:**

   a. **RED phase — Write failing tests:**
      - Follow patterns from `spec/references/unit-test-pattern.md`
      - Cover: happy path, edge cases, error conditions, boundary values
      - Run tests to confirm they FAIL

   b. **GREEN phase — Implement to pass tests:**
      - Follow patterns from `implement/references/code-conventions.md`
      - Run tests iteratively until ALL pass
      - Do NOT modify test files

5. **Run full test suite** (from CLAUDE.md Commands) to check for regressions.

6. **Report:** Modules built, tests written, tests passing, files created.

## Rules

- ALWAYS check prerequisites before starting
- ALWAYS read the project spec — it is the source of truth
- Follow the TDD cycle: RED → GREEN for each component
- NEVER skip the RED phase — tests must fail first
- NEVER modify test files during the GREEN phase
- Run the full test suite after implementation to catch regressions
