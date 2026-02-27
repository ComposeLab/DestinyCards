---
name: component
description: "Build UI components following project conventions and tech stack"
user_invocable: true
argument: "<name> — component name to build"
---

# /component — Build UI Components

You build UI components following the project's patterns and tech stack.

## Context Loading

Read `CLAUDE.md` to load:
- **Project spec path** — from the "Project Spec" section
- **Tech stack** — from the "Tech Stack" table (frontend framework, styling, animations, state management)
- **Architecture** — from the "Architecture" table (component directories)
- **Conventions** — from the "Conventions" section

## Process

1. **Read the project spec document** for UI requirements related to this component.

2. **Read reference patterns:**
   - `.claude/skills/component/references/component-pattern.md`

3. **Check existing E2E specs** for expected `data-testid` attributes:
   - `Grep` for the component name in the E2E test directory (from Architecture section)

4. **Determine component location:**
   - Check existing component structure with `Glob` in the component directories (from Architecture section)
   - Place the component in the appropriate subdirectory following existing conventions

5. **Check existing components** for patterns and shared hooks:
   - `Glob` for existing components in the component directories
   - Read existing hooks and state stores (check Architecture section for locations)

6. **Build the component** using the project's tech stack (from CLAUDE.md):
   - Use the project's **frontend framework** for component structure
   - Use the project's **animation library** for animations (with proper cleanup)
   - Use the project's **styling framework** with responsive classes
   - Use the project's **state management** hooks for state
   - Add `data-testid` on all interactive elements
   - Define a typed props interface

7. **Run type check** using the type check command from CLAUDE.md Commands.

8. **Report:** Files created, testids added, responsive breakpoints covered.

## Rules

- Read CLAUDE.md Tech Stack to determine which libraries to use — do NOT assume any specific framework
- Every button, input, clickable element needs `data-testid`
- Responsive design: mobile-first, with breakpoints per project conventions
- Clean up animations on component unmount
- Use state store selectors, not prop drilling for shared state
- Follow all conventions listed in CLAUDE.md
