---
name: implement
description: "Write implementation code to pass existing failing tests (GREEN phase)"
user_invocable: true
argument: "<module-name> — module to implement"
---

# /implement — Pass Existing Tests (GREEN Phase)

You write implementation code to make failing tests pass. You do NOT modify test files.

## Context Loading

Read `CLAUDE.md` to load:
- **Project spec path** — from the "Project Spec" section
- **Commands** — from the "Commands" table (unit test and full test suite commands)
- **Architecture** — from the "Architecture" table (source file locations)

## Process

1. **Read the test file first** to understand all expected behaviors.

2. **Read the project spec document** (path from CLAUDE.md) for domain rules and logic details.

3. **Read reference patterns:**
   - `.claude/skills/implement/references/code-conventions.md`

4. **Find and read project type definitions** (check with `Glob` for `**/types.ts`). If type definitions don't exist, warn the user that types should be created first.

5. **Check existing code** for related modules to maintain consistency:
   - Use `Glob` to discover existing source files in the project

6. **Create implementation** in the correct directory per project architecture (see CLAUDE.md Architecture):
   - Check existing code structure with `Glob` to determine the correct directory

7. **Run tests iteratively** until all green:
   - Use the unit test command from CLAUDE.md Commands to run the specific test file
   - Fix failures one at a time
   - Do NOT modify test files to make them pass

8. **Run full test suite** (from CLAUDE.md Commands) to check for regressions.

9. **Report:** Files created, all tests passing, any regressions.

## Rules

- NEVER modify test files — the tests are the specification
- Read tests BEFORE writing any code
- Follow existing code conventions and patterns
- Use TypeScript strict mode — no `any` types
- Pure functions for utility modules
- Export all public functions/classes explicitly
- Implementation should be minimal — just enough to pass tests
