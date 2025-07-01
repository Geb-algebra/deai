# System Patterns

## System Architecture

### High-Level Architecture

The application follows a fully client-side architecture, leveraging a Web Worker for AI processing to ensure the UI remains responsive.

```mermaid
graph TD
    subgraph Browser
        subgraph Main Thread
            A[WYSIWYG Editor] -->|onContentChange| B(Input Monitor);
            B -->|onIdle (5s)| C{Generate Question};
            F[Question Display] --> A;
        end

        subgraph Worker Thread
            D[WebLLM Engine]
        end

        C -->|content| D;
        D -->|question| F;
    end
```

### Domain-Driven Design Structure

Following the established DDD patterns, the structure has been adapted for a client-side AI implementation:

```
app/
├── domains/
│   └── ai/
│       ├── models.ts          # AI prompts, responses types
│       ├── factories.ts       # Prompt construction
│       └── webllm-client.ts   # Client to abstract worker communication
├── workers/
│   ├── webllm-worker.ts   # Runs the WebLLM engine
│   └── types.ts           # Shared types for worker communication
├── routes/
│   └── _index.tsx            # Main editor page, state management
└── components/
    ├── QuillEditor.client.tsx
    └── SimpleQuestionDisplay.tsx
```

## Key Technical Decisions

### 1. Editor Technology Choice
- **Selected**: Quill
- **Rationale**: 
  - Rich WYSIWYG capabilities with a clean "bubble" theme.
  - Good React integration and simpler implementation for current needs.

### 2. Input Monitoring Strategy
- **Selected**: Debounced input monitoring with 5-second delay
- **Implementation**: `useEffect` + `setTimeout` in the main route component.
- **Rationale**: 
  - Prevents excessive AI processing.
  - Balances responsiveness with performance.

### 3. LLM Integration Approach
- **Selected**: Client-side inference with WebLLM in a Web Worker.
- **Rationale**: 
  - **Privacy**: No user data leaves the browser.
  - **Performance**: Heavy computation is offloaded from the main UI thread.
  - **Cost**: Zero server-side cost for AI inference.
  - **Simplicity**: No need to manage a server or API keys.

### 4. State Management
- **Selected**: Centralized React state in the main route (`_index.tsx`).
- **Rationale**: 
  - Creates a clear, unidirectional data flow.
  - Avoids state synchronization issues between components.
  - Sufficient for the current application complexity.

## Design Patterns

### 1. Container/Presentational Pattern
- `_index.tsx` acts as a **Container** component, managing all state and logic.
- `SimpleQuestionDisplay.tsx` is a **Presentational** component, rendering data passed via props.

### 2. Worker/Main Thread Communication
- A dedicated `WebLLMClient` abstracts the `postMessage` communication with the Web Worker, simplifying its use in the main application.

### 3. Factory Pattern
- Domain object creation for AI prompts and responses is handled through factories.

## Component Relationships

### _index.tsx (Container)
```
_index.tsx (Route)
├── State: content, question, progress, loading state, error state
├── Effects: input monitoring, WebLLM loading and generation
├── Handlers: onContentChange, onIdle
└── Children: QuillEditor, SimpleQuestionDisplay
```

### QuillEditor.client.tsx
```
QuillEditor.client.tsx
├── Props: onContentChange, onIdle
├── State: Internal editor state
└── Events: Manages editor events and calls back to parent on change/idle
```

### SimpleQuestionDisplay.tsx (Presentational)
```
SimpleQuestionDisplay.tsx
├── Props: question, modelLoading, progress, isGenerating, error
├── State: none (stateless)
└── Renders the UI based entirely on the props it receives.
```

## Data Flow

### Content Update Flow
```