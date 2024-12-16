# Peppy Memes

A modern meme sharing platform built with React and TypeScript.

## Project Specifications

### Tech Stack
- Framework: React 18 with TypeScript
- Build Tool: Vite
- Testing: Vitest with React Testing Library
- Styling: TailwindCSS
- Database: Supabase
- State Management: Zustand
- Router: React Router v6

### Development Environment
- Node.js v18+
- npm v9+
- TypeScript v5+

### Key Dependencies
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.0.0",
    "lucide-react": "^0.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-router-dom": "^6.0.0",
    "zustand": "^4.0.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@types/react": "^18.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0",
    "tailwindcss": "^3.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.0.0",
    "vitest": "^0.34.0"
  }
}
```

### Project Structure
```
src/
  components/        # React components
  services/         # Business logic and API calls
  store/            # Zustand stores
  types/            # TypeScript types and interfaces
  test/            # Test utilities and factories
  config/          # Configuration files
```

### Testing Strategy
- Unit Tests: Components and services
- Test Runner: Vitest
- Test Files: Located next to the files they test
- Naming Convention: `*.test.tsx` or `*.test.ts`
- Mock Strategy: Manual mocks in `__mocks__` directories
- Test Utils: Located in `src/test/`

### Code Style
- ESLint for linting
- Prettier for formatting
- TypeScript strict mode enabled
- File naming: PascalCase for components, camelCase for others
- Test file location: Same directory as tested file

### State Management
- Zustand for global state
- React hooks for local state
- Persistent state with Zustand middleware

### API Integration
- Supabase for backend
- RESTful endpoints
- Real-time subscriptions where needed
- Error handling with custom error types

### Mobile Support
- Responsive design with Tailwind
- Touch-friendly interactions
- Safe area insets for modern mobile browsers
- Mobile-first development approach

## Development Guidelines

1. Always write tests for new features
2. Use TypeScript strictly - no any types
3. Follow component composition patterns
4. Handle all error cases
5. Consider mobile users first
6. Keep bundle size in check
7. Use semantic HTML
8. Follow accessibility best practices
