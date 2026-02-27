# Code Conventions

## TypeScript

- Strict mode enabled — no `any`, no implicit returns
- Use `interface` for object shapes, `type` for unions/intersections
- Export all public functions/classes/types explicitly
- Use `readonly` for immutable properties

## Naming

| Thing | Convention | Example |
|-------|-----------|---------|
| Files | kebab-case | `domain-service.ts` |
| Classes | PascalCase | `DomainService` |
| Functions | camelCase | `processAction()` |
| Constants | SCREAMING_SNAKE | `MAX_ITEMS` |
| Types/Interfaces | PascalCase | `EntityState` |
| Test files | `<module>.test.ts` | `domain-service.test.ts` |

## Module Patterns

### Pure Utility Modules

Use static methods or exported functions. No side effects, no state.

```typescript
// Static method pattern
export class DomainService {
  static evaluate(items: Item[]): Result {
    // pure logic
  }

  static compare(a: Result, b: Result): number {
    // pure comparison
  }
}
```

Or named exports:

```typescript
// Named export pattern
export function createCollection(): Item[] { /* ... */ }
export function shuffle<T>(items: T[]): T[] { /* ... */ }
export function deal<T>(items: T[], count: number): [T[], T[]] { /* ... */ }
```

### Stateful Engine

Class-based with clear state transitions:

```typescript
export class Engine {
  private state: GameState;

  constructor(state: GameState) {
    this.state = state;
  }

  processAction(playerId: string, action: Action): GameState {
    // validate, update state, return new state
  }
}
```

### State Immutability

Server state updates should return new objects, not mutate in place:

```typescript
// Good — returns new state
function addItem(collection: Collection, item: Item): Collection {
  return {
    ...collection,
    items: [...collection.items, item],
  };
}

// Bad — mutates in place
function addItem(collection: Collection, item: Item): void {
  collection.items.push(item); // DON'T
}
```

## File Organization

Follow the project architecture (see CLAUDE.md Architecture table).
Check existing directory structure for the correct locations of domain logic, state management, communication handlers, and utilities.

## Error Handling

- Throw descriptive errors for invalid actions
- Validators return `{ valid: boolean; error?: string }`
- Engine methods should validate before mutating state

## Imports

- Use relative imports within the server/backend directory
- Use path aliases (e.g., `@/`) for frontend imports if configured
- Group imports: external libs → internal modules → types
