---
applyTo: '**'
---

# ESLint Code Style Guidelines

Follow these rules when generating or modifying code to match the project's ESLint configuration.

## Stylistic Rules

### Indentation and Formatting
- **Indent**: Use 2 spaces for indentation
- **Quotes**: Use single quotes (`'`) for strings
- **Semicolons**: Always include semicolons
- **Brace Style**: Use `1tbs` (one true brace style)
  ```tsx
  if (condition) {
    // code
  } else {
    // code
  }
  ```

### JSX Rules
- **Curly Braces**: Always use curly braces in JSX, even for string literals
  ```tsx
  // ✅ Correct
  <Button label={'Click me'} isActive={true} />
  
  // ❌ Incorrect
  <Button label="Click me" isActive={true} />
  ```

## Spacing and Padding Rules

### Blank Lines Between Statements
- **After variable declarations**: Always add blank line after `const`, `let`, `var` blocks
- **Before return statements**: Always add blank line before `return`
- **Around blocks**: Always add blank lines before and after block statements
- **Around block-like statements**: Always add blank lines before and after block-like statements (if, for, while, etc.)
- **After imports**: Always add blank line between imports and variable declarations

```tsx
// ✅ Correct
import { useState } from 'react';

const MyComponent = () => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  if (count > 5) {
    console.info('Count is high');
  }

  return <div>{count}</div>;
};

// ❌ Incorrect
import { useState } from 'react';
const MyComponent = () => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  if (count > 5) {
    console.info('Count is high');
  }
  return <div>{count}</div>;
};
```

## TypeScript Rules

### Type Safety
- **No `any` type**: Never use `any` type - use proper types or `unknown` with type guards
- **Explicit function return types**: Always specify return types for functions (warning level)
  ```tsx
  // ✅ Correct
  function calculateSum(a: number, b: number): number {
    return a + b;
  }
  
  // ❌ Incorrect
  function calculateSum(a: number, b: number) {
    return a + b;
  }
  ```

### Type Assertions
- **No unsafe assertions**: Avoid using `as` casts
- **Use type predicates**: Use type guards and predicates instead of type assertions
  ```tsx
  // ✅ Correct
  function isString(value: unknown): value is string {
    return typeof value === 'string';
  }
  
  // ❌ Incorrect
  const value = unknownValue as string;
  ```

### Naming Conventions
- **Private members**: Prefix with underscore
  ```tsx
  class MyClass {
    private _privateField: string;
    
    constructor() {
      this._privateField = 'value';
    }
  }
  ```

### Member Ordering
Order class members as:
1. Public static fields
2. Static fields
3. Instance fields
4. Public instance methods
5. Public static fields (if not at top)

## General JavaScript/TypeScript Rules

### Arrow Functions
- **Arrow body style**: Use implicit return when possible (`as-needed`)
  ```tsx
  // ✅ Correct
  const double = (x: number): number => x * 2;
  
  // ❌ Incorrect (when body is single expression)
  const double = (x: number): number => {
    return x * 2;
  };
  ```

### Control Flow
- **Curly braces**: Always use curly braces for control statements
  ```tsx
  // ✅ Correct
  if (condition) {
    doSomething();
  }
  
  // ❌ Incorrect
  if (condition) doSomething();
  ```

### Console Usage
- **Allowed**: `console.info()`, `console.warn()`, `console.error()`
- **Not allowed**: `console.log()`, `console.debug()`, etc.

### Variable Declarations
- **Prefer const**: Use `const` by default, only use `let` when reassignment is needed

## Files to Ignore
ESLint ignores these patterns:
- `**/node_modules/**`
- `**/dist/**`
- `**/.turbo/**`
- `**/.wrangler/**`
- `**/.tanstack/**`

## Quick Reference Checklist

When writing code, ensure:
- [ ] 2-space indentation
- [ ] Single quotes for strings
- [ ] Semicolons at end of statements
- [ ] JSX attributes always use curly braces
- [ ] Blank line after variable declarations
- [ ] Blank line before return statements
- [ ] Blank lines around blocks
- [ ] Explicit function return types
- [ ] No `any` types
- [ ] Use `const` by default
- [ ] Arrow functions use implicit return when possible
- [ ] Curly braces for all control statements
- [ ] Use `console.info/warn/error` instead of `console.log`
- [ ] Private class members prefixed with underscore