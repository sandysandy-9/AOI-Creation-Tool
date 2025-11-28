# Contributing to AOI Creation Tool

Thank you for your interest in contributing to the AOI Creation Tool! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- A modern web browser (Chrome, Firefox, Edge)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aoi-creation-tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
├── utils/          # Helper functions
├── App.tsx         # Root component
└── main.tsx        # Application entry point
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

- Write clean, readable code
- Follow the existing code style
- Add TypeScript types for all new code
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Build the project
npm run build

# Run E2E tests
npm run test
```

### 4. Commit Your Changes

Follow conventional commit messages:

```bash
git commit -m "feat: add new drawing tool"
git commit -m "fix: resolve layer toggle bug"
git commit -m "docs: update README with new features"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Avoid `any` type - use `unknown` or proper types
- Use type imports: `import type { Type } from './types'`
- Define interfaces for all data structures

### React

- Use functional components with hooks
- Prefer named exports over default exports
- Keep components small and focused
- Use custom hooks for reusable logic

### Naming Conventions

- **Components**: PascalCase (`MapComponent.tsx`)
- **Hooks**: camelCase with 'use' prefix (`useMapHooks.ts`)
- **Utilities**: camelCase (`helpers.ts`)
- **Types/Interfaces**: PascalCase (`Feature`, `Layer`)
- **CSS Classes**: Tailwind utilities

### File Organization

- One component per file
- Co-locate related files
- Index files for barrel exports (if needed)

## Testing Guidelines

### Writing Tests

- Focus on user behavior, not implementation
- Test critical user paths
- Mock external dependencies (APIs)
- Use descriptive test names

### Test Structure

```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  });

  test('should do something specific', async ({ page }) => {
    // Arrange
    // Act
    // Assert
  });
});
```

## Adding New Features

### 1. Map Features

When adding new map functionality:

1. Create component in `src/components/`
2. Add types to `src/types/index.ts`
3. Update `MapComponent.tsx` to integrate
4. Add tests to `tests/`

### 2. UI Components

For new UI elements:

1. Use Tailwind CSS for styling
2. Ensure responsive design
3. Add accessibility attributes (ARIA labels)
4. Test keyboard navigation

### 3. API Integrations

For new external APIs:

1. Add helper functions to `src/utils/helpers.ts`
2. Define types for API responses
3. Handle errors gracefully
4. Document rate limits and usage

## Performance Considerations

- Debounce user inputs
- Use React.memo for expensive components
- Lazy load heavy dependencies
- Optimize bundle size

## Accessibility

- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast ratios

## Documentation

### Code Documentation

```typescript
/**
 * Searches for a location using Nominatim API
 * @param query - Location search string
 * @returns Promise resolving to array of search results
 */
export const searchLocation = async (query: string): Promise<SearchResult[]> => {
  // Implementation
};
```

### README Updates

Update README.md when:
- Adding new features
- Changing architecture
- Updating dependencies
- Modifying setup steps

## Reporting Issues

### Bug Reports

Include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Browser and OS information

### Feature Requests

Include:
- Problem you're trying to solve
- Proposed solution
- Alternative solutions considered
- Use cases and examples

## Questions?

- Open an issue for general questions
- Use Discussions for broader topics
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
