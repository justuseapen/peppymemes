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
  pages/            # Page components
  services/         # Business logic and API calls
  store/            # Zustand stores
  types/            # TypeScript types and interfaces
  test/            # Test utilities and factories
  config/          # Configuration files
  hooks/           # Custom React hooks
  utils/           # Utility functions
  routes/          # Route definitions
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
9. Implement proper loading states for async operations
10. Use optimistic updates for better UX
11. Implement proper error boundaries
12. Cache API responses when appropriate
13. Use proper image optimization techniques
14. Implement proper security measures for user data
15. Follow responsive design principles
16. Implement proper SEO practices
17. Use proper state management patterns
18. Follow proper routing conventions
19. Implement proper form validation
20. Use proper error messaging

### Application-Specific Guidelines

1. Image Handling
   - Optimize images for different screen sizes
   - Use lazy loading for images
   - Implement proper fallbacks for failed image loads
   - Cache images when appropriate
   - Handle image upload restrictions

2. User Experience
   - Implement smooth transitions between pages
   - Show proper loading states
   - Provide clear feedback for user actions
   - Implement proper error messaging
   - Use optimistic updates for favorites

3. Performance
   - Implement proper pagination
   - Use infinite scroll where appropriate
   - Cache API responses
   - Optimize bundle size
   - Use code splitting

4. Security
   - Implement proper authentication
   - Handle user permissions
   - Sanitize user input
   - Protect user data
   - Follow CORS policies

5. Social Features
   - Implement proper sharing functionality
   - Handle user interactions
   - Implement proper notification system
   - Handle user mentions
   - Implement proper reporting system

6. Content Management
   - Implement proper content moderation
   - Handle inappropriate content
   - Implement proper tagging system
   - Handle duplicate content
   - Implement proper search functionality

7. Mobile Experience
   - Implement proper touch interactions
   - Handle different screen sizes
   - Implement proper gestures
   - Handle offline functionality
   - Optimize for mobile networks

8. Accessibility
   - Provide proper alt text for images
   - Implement proper keyboard navigation
   - Follow ARIA guidelines
   - Implement proper color contrast
   - Handle screen readers

### Developer API

The Peppy Memes API provides both API key and JWT token authentication methods for accessing our meme database.

1. Authentication Methods
   - API Key Authentication: Use `X-API-Key` header for public API access
   - JWT Token Authentication: Use `Authorization: Bearer <token>` header for user-specific operations

2. Available Endpoints

   **Memes**
   - GET /api/v1/memes - List memes with pagination
   - GET /api/v1/memes/{id} - Get specific meme by ID
   - GET /api/v1/memes/search - Search memes by title, tags
   - POST /api/v1/memes - Create a new meme

   **Tags**
   - GET /api/v1/tags - List all available tags
   - GET /api/v1/tags/{tag}/memes - Get memes by specific tag

   **Favorites**
   - POST /api/v1/memes/{id}/favorite - Favorite a meme
   - DELETE /api/v1/memes/{id}/favorite - Unfavorite a meme

3. Rate Limiting & Pricing Tiers
   - Free Tier
     - 100 requests per day
     - Basic search functionality
     - Standard response time

   - Developer Tier ($29/month)
     - 10,000 requests per day
     - Advanced search capabilities
     - Faster response time
     - Email support

4. Image Upload
   - Supported formats: JPEG, PNG, GIF
   - Maximum file size: 10MB
   - Files are stored securely in Supabase storage
   - Automatic optimization for different screen sizes

5. API Response Format
   ```json
   {
     "data": {
       "id": "uuid",
       "title": "string",
       "tags": ["string"],
       "image_url": "string",
       "created_at": "timestamp",
       "user_id": "string",
       "favorite_count": 0,
       "view_count": 0,
       "share_count": 0,
       "download_count": 0,
       "is_favorited": false
     },
     "metadata": {
       "page": 1,
       "per_page": 20,
       "total": 100
     }
   }
   ```

6. Error Handling
   - Standard HTTP status codes
   - Detailed error messages
   - Rate limit headers (`X-RateLimit-Limit`)
   - Request ID for support

7. Creating a Meme
   ```json
   POST /api/v1/memes
   Content-Type: application/json
   Authorization: Bearer <token>

   {
     "title": "string",
     "imageData": "base64 string",
     "contentType": "image/jpeg|image/png|image/gif",
     "tags": ["string"]
   }
   ```

8. Developer Resources
   - Interactive API documentation
   - Rate limit monitoring in response headers
   - Test environment available
   - Comprehensive error messages
