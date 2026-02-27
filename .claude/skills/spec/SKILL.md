---
name: spec
description: "Write failing tests (RED phase) for a module based on the project spec"
user_invocable: true
argument: "<module-name> — server module or feature to write tests for"
---

# /spec — Write Failing Tests (RED Phase)

You write comprehensive failing tests for a module. You do NOT write any implementation code.

## Context Loading

Read `CLAUDE.md` to load:
- **Project spec path** — from the "Project Spec" section
- **Commands** — from the "Commands" table (unit test and E2E test commands)
- **Architecture** — from the "Architecture" table (test file locations)

## Process

1. **Read the project spec document** (path from CLAUDE.md) to understand the module's rules, behavior, and expected outputs.

2. **Check existing specs** using `Glob` to find test files in the project's test directories (see Architecture section in CLAUDE.md) to avoid duplication.

3. **Read reference patterns:**
   - For unit tests: `.claude/skills/spec/references/unit-test-pattern.md`
   - For E2E tests: `.claude/skills/spec/references/e2e-test-pattern.md`

4. **Determine test type and location:**
   - Check existing test locations with `Glob` in the directories listed in CLAUDE.md Architecture
   - Server modules → unit tests in the appropriate test directory
   - Features → E2E tests in the E2E test directory

5. **Soft gate check:** If writing server module tests, verify type definitions exist (check with `Glob` for `**/types.ts`). If missing, warn the user that types should be created first.

6. **Write tests covering:**
   - Happy path — normal expected behavior
   - Edge cases — boundary conditions, empty inputs, max values
   - Error conditions — invalid inputs, illegal states
   - Boundary values — 0, 1, max items, empty collections, etc.

7. **Run tests to confirm they FAIL** using the appropriate command from CLAUDE.md Commands.

8. **Report:** Number of test cases, describe blocks, what's covered.

## Rules

- NEVER write implementation code — only test files
- Tests MUST fail (red phase) — if they pass, something is wrong
- Use helper factories from the reference patterns
- Import from the expected implementation path (even though it doesn't exist yet)
- Each `describe` block should group related behaviors
- Each `it` block should test ONE specific behavior
- Use descriptive test names that read like specifications
