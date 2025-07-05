# ADR: Multi-Provider BYOK with Remix Client Data Flow

## Status

Proposed

## Context

Building on [ADR-0003](./0003-use-byok-for-llm-integration.md), we will support multiple LLM providers (OpenAI, Anthropic, Google) to enhance user flexibility. This plan updates our previous strategy to align with our web framework's best practices by using `clientLoader` and `clientAction` for managing client-side state.

## Decision

We will implement a unified, multi-provider BYOK system using Remix's client-side data handling features.

1.  **Client-Side Data Management with Remix:**
    -   A `clientLoader` function on the main route (`_index.tsx`) will be responsible for reading all API keys from the browser's `localStorage` on page load.
    -   A `clientAction` function on the same route will handle the submission of API keys from the UI, writing them securely back to `localStorage`.

2.  **Provider-Agnostic Abstraction:**
    -   Define a common `LLMClient` interface to standardize interactions with different LLM APIs (e.g., `streamCompletion(prompt, key)`).
    -   Create concrete client implementations for each supported provider (`OpenAIClient`, `ClaudeClient`, `GeminiClient`) that adhere to the interface.

3.  **Dynamic Client Factory:**
    -   A factory function will instantiate the correct `LLMClient` based on the user's current provider selection.

4.  **UI Integration:**
    -   The UI will feature a dropdown for provider selection.
    -   The main route component will receive the loaded API keys via its `loaderData` prop, as returned from `clientLoader`.
    -   The API key input modal will use the `useFetcher` hook. Its `<fetcher.Form>` will submit key data to the `clientAction` without causing a page navigation, enabling the modal to manage its own UI state during submission.

## Consequences

### Pros

- **Alignment with Framework:** Tightly integrates with the Remix data flow, leading to more predictable and maintainable code.
- **Type-Safe Data:** `clientLoader` provides type-safe data to the component, reducing potential runtime errors.
- **User Flexibility:** Users can switch between different high-quality LLMs.
- **Extensibility:** The architecture simplifies adding new providers.
- **Maintains Privacy:** No user data or keys are sent to our servers.

### Cons

- **Increased Complexity:** Managing multiple SDKs and client implementations adds initial overhead.
- **Dependency Management:** The project will have more external dependencies.
- **Inconsistent UX:** Differences in model performance and rate limits across providers could lead to a less consistent user experience.

## Related Decisions

- We will install the official SDKs for each provider (`openai`, `@anthropic-ai/sdk`, `@google/generative-ai`).
- The system will rely on client-side streaming for UI responsiveness. 