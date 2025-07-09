# 🧠 Thought-Expanding AI Assist Editor - Functional Specification

## 1. Overview

This application allows users to freely write their thoughts in a WYSIWYG editor.
When the user stops typing for 3 seconds, a user-configured AI (LLM) analyzes the content and returns
thought-provoking questions to help the user expand and deepen their thinking.
The system supports iterative thinking by continuously offering these questions.

---

## 2. Use Case Flow

1. The user configures their preferred LLM provider and API key.
2. The user writes freely in a WYSIWYG editor (typically in bullet-point style)
3. If there is no input for more than 3 seconds, the system sends the editor content to the configured LLM.
4. The LLM analyzes the content, identifies missing aspects or blind spots, and generates a question.
5. The system displays the generated question on screen.
6. The user can clear the history of generated questions at any time.
7. This loop continues until the user stops.

---

## 3. Feature List

### 3.1 Editor Display
- Display a central WYSIWYG text editor (Quill).
- Supports bullet-point input.

### 3.2 Input Monitoring & Trigger
- Detect when user has been idle for 3 seconds.
- Managed by the `onIdle` prop of the editor component.

### 3.3 LLM Integration (BYOK)
- User can select between OpenAI, Anthropic, and Google LLMs.
- User must provide their own API key.
- Sends full editor content to the selected LLM as a prompt.

### 3.4 Question Generation & Display
- Generates one thought-provoking question from the LLM output.
- Displays the question in a list.
- Question history is persisted in `localStorage`.

### 3.5 Question History Management
- Users can view a list of previously generated questions.
- Users can clear the entire question history.

---

## 4. Non-functional Requirements

- **UI/UX**: Clean, distraction-free interface for focused thinking.
- **Response Time**: Ideally within 3 seconds from input inactivity to question display.
- **Privacy**: All user content and API keys are stored only in the user's browser (`localStorage`) and are never sent to the application server.

---

## 5. Planned Future Features

- Thought history storage and reload.
- Customizable question styles (e.g., logical, intuitive, philosophical).
- Automatic thought structuring (grouping/classification).
- Export (Markdown / PDF).
- Allow users to select specific models from a provider.

---

## 6. Target Users

- Creative professionals, planners, researchers, students.
- People who "think by writing".
- Anyone who feels stuck and would benefit from external questioning support.

---
