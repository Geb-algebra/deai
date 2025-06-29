# Project Intelligence Notes

## Memory Bank Initialization (Current Session)

### Key Insights from Setup

1. **Documentation-Driven Development**
   - The memory bank structure provides excellent clarity for project direction
   - Each file serves a specific purpose in the development hierarchy
   - The documentation-first approach prevents scope creep and ensures consistency

2. **Domain-Driven Design Integration**
   - The project naturally fits DDD patterns with clear editor and AI domains
   - Separation of concerns is well-defined from the start
   - Factory and Repository patterns will be crucial for maintainability

3. **Technology Stack Rationale**
   - TipTap chosen for its Prosemirror foundation and React integration
   - React Router v7 provides modern routing with server-side capabilities
   - Hono server offers lightweight, performant API endpoints

### Project-Specific Patterns Identified

1. **AI Integration Pattern**
   - Server-side API approach for security and consistency
   - Debounced input monitoring to balance responsiveness and performance
   - Framework-based questioning for systematic thinking expansion

2. **User Experience Considerations**
   - Non-intrusive AI assistance that doesn't interrupt natural writing flow
   - 5-second inactivity trigger balances responsiveness with user experience
   - Clean, distraction-free interface for focused thinking

3. **Performance Requirements**
   - 3-second response time target for AI questions
   - Efficient handling of large text content
   - Optimized bundle size for fast loading

### Quill Editor CSS Organization Pattern

**CRITICAL RULE**: When working with Quill editor components, CSS organization follows a specific pattern:

1. **Dedicated CSS File**: Create a separate `.css` file in the components directory (e.g., `QuillEditor.css`)
2. **Global Styles Required**: All `.ql-editor` styles MUST be in a global CSS file, not CSS modules
3. **Import Pattern**: Import the dedicated CSS file directly in the component:
   ```tsx
   import "./QuillEditor.css";
   ```
4. **CSS Module Separation**: Use CSS modules only for layout/container styles (`.quillEditorContainer`, `.quillEditor`)
5. **Why This Pattern**: Quill creates its own DOM structure that doesn't inherit CSS module classes

**File Structure**:
- `QuillEditor.css` - Global styles for `.ql-editor` elements (headings, lists, base styles)
- `QuillEditor.module.css` - Scoped styles for container layout and positioning
- `QuillEditor.client.tsx` - Component with both imports

**Styles That Go in Global CSS**:
- `.ql-editor` base styles (font-size, line-height, padding)
- `.ql-editor h1, h2, h3, h4` heading styles
- `.ql-editor ul, ol, li` list styles
- `.ql-editor.ql-blank::before` placeholder styles
- `.ql-editor:focus` focus states
- Responsive media queries for `.ql-editor`

**Styles That Stay in CSS Modules**:
- `.quillEditorContainer` layout and positioning
- `.quillEditor` wrapper styles
- Focus states for containers
- Responsive design for containers

### Current Styling Approach and Challenges

**Current Implementation**:
- **Container**: Grid layout with `grid-template-rows: auto 1fr`
- **Editor**: Uses `height: 100%` and `max-height: 100%` with `overflow-y: auto`
- **Theme Integration**: Uses CSS custom properties (`var(--card)`, `var(--card-foreground)`, etc.)
- **Responsive Design**: Different padding and font sizes for different screen sizes

**Current Height Challenge**:
- **Problem**: Editor height expands to fit content instead of being constrained to parent element height
- **Current Setup**: Uses `height: 100%` which makes it grow with content beyond parent bounds
- **Need**: Editor should be fixed to parent element height and scroll internally when content exceeds available space
- **Solution Needed**: Ensure editor respects parent container height while maintaining internal scrollability

**Styling Decisions Made**:
- **Bubble Theme**: No toolbar for distraction-free writing
- **CSS Variables**: Uses design system colors for consistency
- **Rounded Corners**: `border-radius: 2rem` for modern appearance
- **List Indentation**: Removed padding (`padding: 0`) for compact lists
- **Responsive Typography**: Scaled font sizes for different screen sizes

### Development Process Insights

1. **Staged Development Approach**
   - Clear separation between object creation, service implementation, and UI development
   - Operator review at each stage ensures quality and alignment
   - ADR documentation for key architectural decisions

2. **Testing Strategy**
   - Comprehensive unit testing for all services
   - Component testing for UI elements
   - Integration testing for end-to-end functionality

### Technical Decisions Documented

1. **Editor Technology**: TipTap for rich WYSIWYG capabilities
2. **State Management**: React state with custom hooks for simplicity
3. **Styling Approach**: Tailwind for styling, CSS Modules for layout
4. **Build System**: Vite for fast development and optimized builds

### Next Steps Clarity

The memory bank provides clear direction for:
- Project foundation setup
- Domain object creation (operator task)
- Service implementation planning
- UI component development

### Quality Assurance Approach

- Comprehensive documentation ensures consistent development
- Clear success metrics defined for each phase
- Performance and accessibility requirements established
- Security considerations documented from the start
