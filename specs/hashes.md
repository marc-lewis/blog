# Hashes Specification

## Overview

Hashes are unique 6-digit identifiers assigned to todos. They provide a short, memorable reference for each task, similar to issue numbers in project management systems.

## Format

- **Length**: 6 digits
- **Character set**: Numeric only (0-9)
- **Display format**: Prefixed with `#` (e.g., `#000001`)
- **Storage format**: String without prefix (e.g., `"000001"`)

## Generation

### Sequence-based Approach (Recommended)

```typescript
// Get next hash by incrementing the highest existing hash
async function generateHash(): Promise<string> {
  const lastTodo = await db.todos
    .orderBy('hash')
    .last();
  
  const lastNumber = lastTodo ? parseInt(lastTodo.hash, 10) : 0;
  const nextNumber = lastNumber + 1;
  
  return nextNumber.toString().padStart(6, '0');
}
```

### Properties

- Sequential numbering starting from `000001`
- Zero-padded to 6 digits
- Maximum value: `999999` (sufficient for ~1 million todos)
- Once assigned, a hash is never reused

## Data Model

```typescript
interface HashRecord {
  hash: string;        // The 6-digit hash
  todoId: string;      // Reference to the todo
  createdAt: Date;     // When the hash was assigned
}
```

Note: The hash can also be stored directly on the Todo model rather than in a separate table, depending on database design preferences.

## Business Rules

1. **Uniqueness**: Each hash must be globally unique across all todos
2. **Immutability**: Once assigned, a hash cannot be changed or reassigned
3. **Persistence**: Hashes persist even after todo deletion (for historical reference)
4. **No gaps**: Hashes should be sequential with no gaps (deleted todos retain their hash)
5. **No recycling**: Deleted todo hashes are never reused

## Usage

### In Todos
- Primary identifier displayed to users
- Format: `#000001`

### In Blog Posts
- Reference related work via `hashes` array
- Displayed as links to the original todo (if accessible)
- Format: `#000001, #000002`

### In URLs (Future)
- Potential direct linking: `/todo/000001`
- Could redirect to or display the specific todo

## Display

```svelte
<!-- Todo display -->
<span class="italic text-sm">#{todo.hash}</span>

<!-- Blog post related hashes -->
{#each post.hashes as hash}
  <a href="/todo/{hash}" class="text-sm italic">#{hash}</a>
{/each}
```

## Validation

```typescript
function isValidHash(hash: string): boolean {
  return /^\d{6}$/.test(hash);
}
```

## Edge Cases

### Hash Exhaustion
If approaching `999999`, consider:
1. Extending to 7+ digits
2. Archiving very old completed todos
3. Alerting the administrator

### Migration
Existing placeholder todos should be assigned hashes:
- `000001` - "set up blog"
- `000002` - "write first post"
