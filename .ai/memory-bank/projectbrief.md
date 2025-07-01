# 🧠 Thought-Expanding AI Assist Editor - Functional Specification

## 1. Overview

This application allows users to freely write their thoughts in a WYSIWYG editor.  
When the user stops typing for 5 seconds, an AI (LLM) analyzes the content and returns  
thought-provoking questions to help the user expand and deepen their thinking.  
The system supports iterative thinking by continuously offering these questions.

---

## 2. Use Case Flow

1. The user writes freely in a WYSIWYG editor (typically in bullet-point style)
2. If there is no input for more than 5 seconds, the system sends the editor content to the LLM
3. The LLM analyzes the content, identifies missing aspects or blind spots, and generates questions using frameworks
4. The system displays the generated questions on screen
5. The user continues thinking based on these prompts
6. This loop continues until the user stops

---

## 3. Feature List

### 3.1 Editor Display
- Display a central WYSIWYG text editor
- Supports bullet-point input (via line breaks or markdown-style lists)

### 3.2 Input Monitoring & Trigger
- Detect when user has been idle for 5 seconds
- Use `debounce` or `setTimeout` to manage detection

### 3.3 LLM Integration
- Sends full editor content to LLM as prompt
- Prompt instructs LLM to use frameworks (5W1H, SCAMPER, causality, prioritization, etc.) to analyze thought gaps

### 3.4 Question Generation & Display
- Extract up to 3 thought-provoking questions from the LLM output
- Display these under the editor as "AI prompts to expand your thinking"
- Rendered in Markdown-style bullet list

### 3.5 Thought Loop
- After each user input, system repeats the 5-second wait → trigger → generate question loop
- Continues until the user stops typing

---

## 4. Non-functional Requirements

- **UI/UX**: Clean, distraction-free interface for focused thinking
- **Response Time**: Ideally within 3 seconds from input inactivity to question display
- **Privacy**: No data persistence; input is processed temporarily only
- **Local Inference**: Runs the LLM entirely on the client-side using WebLLM.

---

## 5. Technology Stack (Tentative)

| Feature               | Suggested Technology               |
|-----------------------|------------------------------------|
| Frontend Framework     | React / Next.js / Remix            |
| Editor                 | TipTap / Quill / Slate.js          |
| Input Timing Logic     | `useEffect` + `debounce`           |
| LLM Integration        | WebLLM / OpenAI API / LM Studio    |
| State Management       | React state / Zustand              |

---

## 6. Planned Future Features

- Thought history storage and reload
- Customizable question styles (e.g., logical, intuitive, philosophical)
- Automatic thought structuring (grouping/classification)
- Export (Markdown / PDF)

---

## 7. Target Users

- Creative professionals, planners, researchers, students
- People who "think by writing"
- Anyone who feels stuck and would benefit from external questioning support

---
