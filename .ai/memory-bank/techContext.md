# Technical Context

## Technology Stack

### Core Technologies

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Language** | TypeScript | Latest | Type-safe development |
| **Frontend Framework** | React | Latest | UI components and state management |
| **Router** | React Router v7 | Latest | Client-side routing |
| **Bundler** | Vite | Latest | Fast development and building |
| **Styling** | Tailwind CSS | Latest | Utility-first styling |
| **Layout** | CSS Modules | Native | Component-specific layouts |
| **UI Components** | shadcn/ui | Copy-paste | Pre-built, customizable components |
| **Validation** | Zod | Latest | Runtime type validation |
| **Database ORM** | Drizzle | Latest | Type-safe database operations |
| **Server** | Hono | Latest | Lightweight HTTP server |

### AI Integration

| Component | Technology | Purpose |
|-----------|------------|---------|
| **LLM Integration** | Multi-Provider BYOK | Direct client-to-API communication with OpenAI, Anthropic, and Google. |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting and quality |
| **Prettier** | Code formatting |
| **Vitest** | Unit testing |
| **pnpm** | Package management |

## Development Setup

### Prerequisites

```bash
# Node.js version
node >= 18.0.0

# Package manager
pnpm >= 8.0.0
```

### Environment Variables

```env
# AI Integration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4-turbo-preview

# Database (if using persistence)
DATABASE_URL=your_database_url

# Development
NODE_ENV=development
```

### Project Structure

```
deai/
├── app/
│   ├── domains/           # Domain-driven design
│   │   └── ai/            # AI integration domain
│   ├── components/        # Reusable UI components
│   ├── routes/            # React Router pages
│   ├── workers/           # Web Worker for AI
│   └── utils/             # Utility functions
├── .ai/                   # Memory bank and rules
└── docs/                  # ADRs and other documents
```

## Technical Constraints

### Performance Requirements

- **Response Time**: AI questions should appear within 3 seconds of user inactivity
- **Editor Responsiveness**: No lag during typing
- **Bundle Size**: Keep initial load under 500KB
- **Memory Usage**: Efficient handling of large text content

### Browser Compatibility

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Support**: Responsive design for tablets and phones
- **Progressive Enhancement**: Core functionality works without JavaScript

### Security Constraints

- **API Key Protection**: Never expose API keys in client-side code
- **Input Sanitization**: Sanitize all user input before processing
- **Rate Limiting**: Prevent abuse of AI endpoints
- **Privacy**: No persistent storage of user content by default

### Accessibility Requirements

- **WCAG 2.1 AA**: Full accessibility compliance
- **Keyboard Navigation**: Complete keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators and logical tab order

## Dependencies

### Core Dependencies

```json
{
  "react": "^18.0.0",
  "react-router": "^7.0.0",
  "react-dom": "^18.0.0",
  "typescript": "^5.0.0",
  "vite": "^5.0.0",
  "@vitejs/plugin-react": "^4.0.0"
}
```

### UI Dependencies

```json
{
  "tailwindcss": "^3.0.0",
  "@tiptap/react": "^2.0.0",
  "@tiptap/pm": "^2.0.0",
  "@tiptap/starter-kit": "^2.0.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0"
}
```

### AI Dependencies
```json
{
  "openai": "^4.20.0",
  "@anthropic-ai/sdk": "^0.18.0",
  "@google/generative-ai": "^0.1.0"
}
```

### Validation & Data

```json
{
  "zod": "^3.0.0",
  "drizzle-orm": "^0.29.0",
  "drizzle-kit": "^0.20.0",
  "openai": "^4.20.0",
  "@anthropic-ai/sdk": "^0.18.0",
  "@google/generative-ai": "^0.1.0"
}
```

### Server Dependencies

```json
{
  "hono": "^3.0.0",
  "@hono/node-server": "^1.0.0",
  "openai": "^4.0.0"
}
```

### Development Dependencies

```json
{
  "@types/react": "^18.0.0",
  "@types/react-dom": "^18.0.0",
  "@typescript-eslint/eslint-plugin": "^6.0.0",
  "@typescript-eslint/parser": "^6.0.0",
  "eslint": "^8.0.0",
  "eslint-plugin-react": "^7.0.0",
  "eslint-plugin-react-hooks": "^4.0.0",
  "prettier": "^3.0.0",
  "vitest": "^1.0.0",
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.0.0"
}
```

## Build Configuration

### Vite Configuration

Our Vite configuration is set up to handle TypeScript and React.

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["app/**/*", "server/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist", ".react-router"]
}
```

## Deployment Considerations

### Production Build

- **Static Assets**: Optimized and compressed
- **Code Splitting**: Automatic chunk splitting for better caching
- **Tree Shaking**: Unused code elimination
- **Minification**: JavaScript and CSS minification

### Server Deployment

- **Edge Functions**: Cloudflare Workers or similar
- **API Routes**: Serverless functions for AI integration
- **Caching**: CDN caching for static assets
- **Monitoring**: Error tracking and performance monitoring

### Environment Management

- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Live application with monitoring 