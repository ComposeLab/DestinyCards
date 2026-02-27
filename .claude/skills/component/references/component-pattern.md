# Component Patterns

> **Note:** This file describes generic patterns. Read CLAUDE.md Tech Stack to determine which specific framework, styling library, animation library, and state management to use.

## Basic Structure

A component should follow this general structure:

1. **Framework directive** (if required, e.g., `'use client'` for Next.js App Router)
2. **Imports** — framework, animation library, state hooks, types
3. **Props interface** — typed props with TypeScript
4. **Component function** — refs for animation targets, lifecycle hooks for animations, render with styling classes
5. **data-testid** — on all interactive elements

### Example (framework-agnostic pseudocode)

```
Component({ props }) {
  ref = createRef()

  onMount {
    animate(ref, { from: hidden, to: visible, stagger: index * 0.15 })
    onCleanup { stopAnimations(ref) }
  }

  return (
    <div ref={ref} data-testid="component-name-{qualifier}">
      {/* content with responsive styling classes */}
    </div>
  )
}
```

## Animation Patterns

### Entry Animation
Animate elements when they first appear — fade in, slide, scale, or rotate.

### Transition Animation
Animate state changes — flip, swap, highlight, pulse.

### Stagger Animation
When multiple items appear together, stagger their entry with a small delay between each.

### Cleanup
Always clean up animations when the component unmounts to prevent memory leaks and stale references.

### Implementation Notes
- Use refs to target DOM elements for animation
- Trigger animations in lifecycle hooks (mount, update, unmount)
- Use the project's animation library (from CLAUDE.md Tech Stack) — do not use CSS transitions for complex animations
- Simple hover/focus effects can use CSS transitions

## Responsive Design

Mobile-first approach with breakpoints:

```
Base (mobile)  → small adjustments → medium (tablet) → large (desktop)
```

### Layout Strategy
- Mobile: stacked/simplified layouts
- Tablet: intermediate layouts (e.g., semi-circular, grid)
- Desktop: full layouts (e.g., oval, wide grid)

Use the project's styling framework responsive utilities (e.g., Tailwind's `sm:`, `md:`, `lg:` prefixes).

## State Consumption

Use the project's state management library (from CLAUDE.md Tech Stack):
- Use **selectors** to subscribe to specific state slices, not the entire store
- This prevents unnecessary re-renders when unrelated state changes
- Read state store files to understand available state and actions

```
// Good — subscribes to one field
value = useStore(state => state.specificField)

// Bad — subscribes to entire store
store = useStore()
```

## data-testid Convention

Every interactive element MUST have a `data-testid`:

```
<button data-testid="action-submit-btn">Submit</button>
<input data-testid="name-input" />
<div data-testid="player-seat-0">...</div>
<div data-testid="status-display">...</div>
```

Naming pattern: `<component>-<element>[-<qualifier>]`

## Component Checklist

- [ ] Framework directive if required (e.g., `'use client'`)
- [ ] TypeScript props interface
- [ ] `data-testid` on interactive elements
- [ ] Responsive classes (mobile/tablet/desktop)
- [ ] Animation cleanup on unmount
- [ ] State store selectors (not full store) for performance
- [ ] Styling via project's styling framework — no inline styles
