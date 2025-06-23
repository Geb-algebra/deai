# System Patterns

## System Architecture

### High-Level Architecture

The application follows a client-server architecture with the following key components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WYSIWYG       │    │   Input         │    │   LLM           │
│   Editor        │◄──►│   Monitor       │◄──►│   Integration   │
│   (Client)      │    │   (Client)      │    │   (Server)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Question      │    │   Debounce      │    │   Framework     │
│   Display       │    │   Logic         │    │   Analysis      │
│   (Client)      │    │   (Client)      │    │   (Server)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Domain-Driven Design Structure

Following the established DDD patterns:

```
app/
├── domains/
│   ├── editor/
│   │   ├── models.ts          # Editor content, questions types
│   │   ├── factories.ts       # Editor content creation
│   │   ├── repositories.ts    # Content persistence (optional)
│   │   └── services.ts        # Content analysis, question generation
│   └── ai/
│       ├── models.ts          # AI prompts, responses types
│       ├── factories.ts       # Prompt construction
│       ├── repositories.ts    # AI service integration
│       └── services.ts        # LLM communication, response parsing
├── routes/
│   └── _index.tsx            # Main editor page
└── components/
    ├── Editor/
    │   ├── WYSIWYGEditor.tsx
    │   └── WYSIWYGEditor.module.css
    └── Questions/
        ├── QuestionDisplay.tsx
        └── QuestionDisplay.module.css
```

## Key Technical Decisions

### 1. Editor Technology Choice
- **Selected**: TipTap (Prosemirror-based)
- **Rationale**: 
  - Rich WYSIWYG capabilities
  - Good React integration
  - Extensible for future features
  - Active maintenance and community

### 2. Input Monitoring Strategy
- **Selected**: Debounced input monitoring with 5-second delay
- **Implementation**: `useEffect` + `setTimeout` with cleanup
- **Rationale**: 
  - Prevents excessive API calls
  - Balances responsiveness with performance
  - Allows natural typing pauses

### 3. LLM Integration Approach
- **Selected**: Server-side API integration
- **Rationale**: 
  - Better security for API keys
  - Consistent response formatting
  - Easier to implement rate limiting
  - Future extensibility for multiple LLM providers

### 4. State Management
- **Selected**: React state with custom hooks
- **Rationale**: 
  - Simple state requirements
  - No complex global state needed
  - Easy to test and maintain

## Design Patterns

### 1. Observer Pattern
- Input monitoring observes editor changes
- Question display observes AI response changes

### 2. Factory Pattern
- Domain object creation through factories
- Ensures proper initialization and validation

### 3. Repository Pattern
- Abstract data access layer
- Enables easy testing and future storage changes

### 4. Service Layer Pattern
- Business logic isolated in pure functions
- No side effects, easy to test

### 5. Component Composition
- Editor and Questions as separate components
- Clear separation of concerns
- Reusable and testable

## Component Relationships

### Editor Component
```
WYSIWYGEditor
├── Props: content, onContentChange
├── State: local content, isTyping
├── Events: input, blur, focus
└── Children: TipTap editor instance
```

### Question Display Component
```
QuestionDisplay
├── Props: questions[], isLoading
├── State: none (stateless)
├── Events: none
└── Children: Question items
```

### Main Page Component
```
_index.tsx (Route)
├── State: content, questions, isAnalyzing
├── Effects: input monitoring, AI calls
├── Handlers: content updates, AI responses
└── Children: WYSIWYGEditor, QuestionDisplay
```

## Data Flow

### Content Update Flow
```
User Types → Editor Component → Content Change → 
Input Monitor → Debounce Timer → AI Service Call → 
Response Processing → Question Display Update
```

### Error Handling Flow
```
API Error → Error Boundary → User Notification → 
Graceful Degradation → Retry Logic (optional)
```

## Performance Considerations

### 1. Debouncing
- 5-second delay prevents excessive API calls
- Cleanup on component unmount

### 2. Content Optimization
- Only send meaningful content changes
- Avoid sending empty or minimal content

### 3. Response Caching
- Cache similar responses to reduce API calls
- Implement intelligent deduplication

### 4. Lazy Loading
- Load editor components on demand
- Optimize bundle size for core functionality

## Security Patterns

### 1. Input Sanitization
- Sanitize user content before sending to AI
- Prevent injection attacks

### 2. API Key Protection
- Server-side API key storage
- Rate limiting on AI endpoints

### 3. Content Privacy
- No persistent storage by default
- Clear privacy policy for temporary processing 