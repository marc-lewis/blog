# Agent Guidelines

## Commit Messages

Use semantic commit messages following the conventional commits specification.

### Format

```
<type>(<scope>): <subject>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Formatting, missing semicolons, etc. (no code change)
- **refactor**: Code restructuring without changing behaviour
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates, etc.

### Examples

```
feat(blog): add new post about Kubernetes
fix(header): correct navigation link alignment
docs(readme): update installation instructions
refactor(posts): simplify date parsing logic
chore(deps): update SvelteKit to latest version
```
