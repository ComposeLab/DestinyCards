# Unit Test Patterns

## File Structure

```typescript
import { describe, it, expect, beforeEach } from '<test-runner>';
// Import from the expected implementation path
import { DomainService } from '<path-per-architecture>';
import type { Entity } from '<path-to-types>';

describe('DomainService', () => {
  describe('processAction', () => {
    it('should handle the standard case correctly', () => {
      const entity = createTestEntity();
      const result = DomainService.processAction(entity);
      expect(result.status).toBe('processed');
    });

    it('should reject invalid input', () => {
      expect(() => DomainService.processAction(null)).toThrow();
    });
  });

  describe('compareEntities', () => {
    it('should return positive when first entity ranks higher', () => {
      // ...
    });
  });
});
```

## Helper Factories

### Generic Factory Pattern — `createTest<Entity>(overrides)`

Create factory functions for each domain entity. The factory provides sensible defaults and accepts partial overrides:

```typescript
function createTestEntity(overrides: Partial<Entity> = {}): Entity {
  return {
    id: 'entity-1',
    name: 'Test Entity',
    status: 'active',
    value: 0,
    items: [],
    ...overrides,
  };
}
```

### Tips for Factory Design

- One factory per domain type (e.g., `createTestPlayer`, `createTestRoom`, `createTestItem`)
- Defaults should represent the most common valid state
- Use `Partial<T>` for the overrides parameter
- Add shorthand helpers for frequently constructed values (e.g., a notation parser for domain-specific objects)

### Shorthand Helper Example

If your domain has objects that are tedious to construct, create a shorthand:

```typescript
/** Create a domain object from compact notation */
function fromNotation(notation: string): DomainObject {
  // Parse notation into a fully typed object
  // e.g., "A-red" → { rank: 'A', color: 'red' }
}
```

## Conventions

- Group tests by method/function in nested `describe` blocks
- Use `it('should ...')` for test descriptions — reads like a spec
- One assertion per test when practical (ok to have multiple related assertions)
- Use `beforeEach` for setup that's shared across tests in a describe block
- Put helper factories at the top of the test file or in a shared helpers file in the test directory
- Test error cases with `expect(() => fn()).toThrow('message')`
- Use `toBe` for primitives, `toEqual` for objects/arrays, `toContain` for array membership
