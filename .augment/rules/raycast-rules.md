---
type: "always_apply"
---

# Raycast Pomodoro Extension - Coding Guidelines

## Table of Contents

- [File Organization](#file-organization)
- [Component Structure](#component-structure)
- [TypeScript Standards](#typescript-standards)
- [Import/Export Patterns](#importexport-patterns)
- [Code Quality](#code-quality)
- [Testing Guidelines](#testing-guidelines)
- [Performance Considerations](#performance-considerations)

## File Organization

### 500-Line Rule

**CRITICAL RULE**: Files exceeding 500 lines MUST be refactored into separate components for better code organization and maintainability.

#### When to Refactor:

- Any single file reaches 500+ lines
- Complex components with multiple responsibilities
- Repeated logic that can be extracted into reusable components

#### Refactoring Strategy:

1. **Extract UI Components**: Move complex rendering logic into dedicated components
2. **Create Utility Components**: Extract reusable UI patterns
3. **Separate Business Logic**: Move complex state management to custom hooks
4. **Organize by Feature**: Group related components in feature-specific directories

### Directory Structure

```
src/
├── components/
│   ├── common/           # Reusable UI components
│   ├── history/          # History-specific components
│   ├── mood-tracking/    # Mood tracking components
│   ├── session-editing/  # Session management components
│   └── forms/           # Form components
├── hooks/               # Custom React hooks
├── services/           # Business logic services
├── store/              # State management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── constants/          # Constants and design tokens
```

## Component Structure

### Component Naming

- Use PascalCase for component names
- Use descriptive, specific names (e.g., `SessionListItem` not `ListItem`)
- Prefix with feature area when appropriate (e.g., `HistorySessionItem`)

### Component Organization

```typescript
// 1. Imports (grouped and sorted)
import { React imports } from "react";
import { Raycast imports } from "@raycast/api";
import { Internal imports } from "../relative/paths";

// 2. Type definitions
interface ComponentProps {
  // Props interface
}

// 3. Component implementation
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Component logic
}

// 4. Helper functions (if small and component-specific)
function helperFunction() {
  // Helper logic
}
```

### Props Interface Standards

- Always define explicit TypeScript interfaces for props
- Use descriptive property names
- Include JSDoc comments for complex props
- Mark optional props with `?`
- Use union types for constrained values

```typescript
interface SessionListItemProps {
  /** The timer session to display */
  session: TimerSession;
  /** Whether to show detailed information */
  showDetail?: boolean;
  /** Callback when session is selected */
  onSelect?: (session: TimerSession) => void;
  /** Additional CSS classes */
  className?: string;
}
```

## TypeScript Standards

### Type Safety

- Use strict TypeScript configuration
- Avoid `any` type - use proper typing or `unknown`
- Use type guards for runtime type checking
- Prefer interfaces over types for object shapes
- Use enums for constrained string values

### Generic Types

```typescript
// Good: Generic utility functions
function filterItems<T>(items: T[], predicate: (item: T) => boolean): T[] {
  return items.filter(predicate);
}

// Good: Constrained generics
interface Repository<T extends { id: string }> {
  findById(id: string): T | undefined;
  save(item: T): void;
}
```

## Import/Export Patterns

### Import Organization

1. React and external libraries
2. Raycast API imports
3. Internal imports (absolute paths preferred)
4. Relative imports
5. Type-only imports (use `import type`)

```typescript
import { useState, useEffect } from "react";
import { List, Action, ActionPanel } from "@raycast/api";
import { useTimerStore } from "@/store/timer-store";
import { formatTime } from "../utils/helpers";
import type { TimerSession } from "@/types/timer";
```

### Export Patterns

- Use named exports for components and utilities
- Use default exports only for main page components
- Export types and interfaces alongside implementations
- Use barrel exports (`index.ts`) for feature modules

```typescript
// components/history/index.ts
export { SessionListItem } from "./SessionListItem";
export { SessionMoodIndicators } from "./SessionMoodIndicators";
export { HistoryFilters } from "./HistoryFilters";
export type { SessionListItemProps } from "./SessionListItem";
```

## Code Quality

### Function Size

- Keep functions under 50 lines when possible
- Extract complex logic into smaller, focused functions
- Use early returns to reduce nesting
- Prefer pure functions when possible

### Variable Naming

- Use descriptive names (`sessionMoodEntries` not `entries`)
- Use camelCase for variables and functions
- Use UPPER_SNAKE_CASE for constants
- Use boolean prefixes (`is`, `has`, `should`, `can`)

### Comments and Documentation

- Use JSDoc for public APIs and complex functions
- Explain "why" not "what" in comments
- Keep comments up-to-date with code changes
- Use TODO comments with issue references

```typescript
/**
 * Calculates the display title for a timer session.
 * For work sessions, shows task name if available, otherwise falls back to session type.
 *
 * @param session - The timer session to get title for
 * @returns The display title string
 */
function getSessionDisplayTitle(session: TimerSession): string {
  // Show task name for work sessions to improve scanability
  if (session.type === SessionType.WORK && session.taskName) {
    return session.taskName;
  }

  return getSessionTypeLabel(session.type);
}
```

## Testing Guidelines

### Component Testing

- Test component behavior, not implementation details
- Use React Testing Library for component tests
- Mock external dependencies and services
- Test accessibility features

### Test Organization

```
src/
├── components/
│   └── __tests__/
│       ├── SessionListItem.test.tsx
│       └── SessionMoodIndicators.test.tsx
└── utils/
    └── __tests__/
        └── helpers.test.ts
```

## Performance Considerations

### React Performance

- Use `useMemo` for expensive calculations
- Use `useCallback` for event handlers passed to children
- Avoid creating objects/functions in render
- Use proper dependency arrays in hooks

### Raycast-Specific

- Minimize API calls in list items
- Use proper loading states
- Implement proper error boundaries
- Optimize image loading and caching

### Memory Management

- Clean up subscriptions and timers
- Avoid memory leaks in custom hooks
- Use proper cleanup in `useEffect`

## Enforcement

### Pre-commit Checks

- TypeScript compilation must pass
- ESLint rules must pass
- File size limits enforced
- Import organization verified

### Code Review Checklist

- [ ] File size under 500 lines or properly refactored
- [ ] Proper TypeScript typing
- [ ] Component props interfaces defined
- [ ] Imports organized correctly
- [ ] Functions under 50 lines
- [ ] Descriptive naming used
- [ ] Comments explain complex logic
- [ ] No `any` types used
- [ ] Performance considerations addressed

---

_This document should be updated as the project evolves and new patterns emerge._
