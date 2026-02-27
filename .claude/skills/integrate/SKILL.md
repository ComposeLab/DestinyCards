---
name: integrate
description: "Wire communication layer and client state for a feature"
user_invocable: true
argument: "<feature> — feature to integrate"
---

# /integrate — Wire Communication + Client State

You connect the server-side handlers, client communication layer, and client state store for a feature.

## Context Loading

Read `CLAUDE.md` to load:
- **Project spec path** — from the "Project Spec" section
- **Tech stack** — from the "Tech Stack" table (realtime/communication, state management)
- **Architecture** — from the "Architecture" table (handler, client, store directories)
- **Event contract location** — from the "Event Contract" section
- **Commands** — from the "Commands" table (E2E test command)

## Process

1. **Read the project spec document** (path from CLAUDE.md) for the communication event contract related to this feature (location specified in CLAUDE.md Event Contract section).

2. **Read existing integration code:**
   - Use `Glob` to find server handlers, client communication modules, state stores, and hooks in the directories listed in CLAUDE.md Architecture

3. **Identify events to wire:**
   - Read the event contract from the project spec
   - Determine which client→server and server→client events are needed for this feature

4. **Update files:**
   - Server handler: add/update event listeners
   - Client communication module: add emit functions
   - State store: add state and actions
   - Hooks: update or create hooks for the feature

5. **Write E2E tests** for the full round-trip:
   - Create E2E spec if it doesn't exist
   - Test: client emits → server processes → server broadcasts → client updates

6. **Run E2E tests** using the E2E test command from CLAUDE.md Commands.

7. **Report:** Events wired, store actions added, E2E tests passing.

## Rules

- Server is authoritative — all game logic stays server-side
- Client only sends intents/actions, server validates and broadcasts state
- State store receives state via communication events, not direct manipulation
- Always handle disconnection/reconnection gracefully
- E2E tests must cover the full round-trip flow
- Read CLAUDE.md Tech Stack to determine which communication and state libraries to use
