# Active Context

## Current Work Focus

### Project Status: Pivoting to Multi-Provider BYOK Architecture

The project is undergoing a strategic pivot away from a client-side WebLLM implementation to a more flexible and powerful "Bring Your Own Key" (BYOK) model. The core goal is to allow users to connect directly to multiple high-quality LLM providers (OpenAI, Anthropic, Google) from their browser.

This decision, documented in [ADR-0003](./../docs/adr/0003-use-byok-for-llm-integration.md) and [ADR-0004](./../docs/adr/0004-multi-provider-byok-llm-integration.md), prioritizes model quality and user flexibility while maintaining a strong commitment to privacy by keeping all user data and keys on the client-side.

## Recent Changes

### Architectural Pivot (Current Session)
- **Decision**: Deprecated the WebLLM architecture due to performance and quality concerns.
- **New Strategy**: Adopted a multi-provider BYOK strategy.
- **Documentation**: Updated `systemPatterns.md` and `techContext.md` to reflect the new architecture. Created ADR-0004 to document the technical plan for the multi-provider implementation.

## Next Steps

### Immediate Next Steps (Implementation Plan)

1.  **Dependencies**
    - [ ] Install `openai`, `@anthropic-ai/sdk`, and `@google/generative-ai` packages.
2.  **Domain Implementation**
    - [ ] Define a common `LLMClient` interface in `app/domains/ai/models.ts`.
    - [ ] Implement `OpenAIClient`, `ClaudeClient`, and `GeminiClient`, each conforming to the `LLMClient` interface.
    - [ ] Create the `AIFactory` to dynamically instantiate the correct client.
3.  **Client-Side Data Management**
    - [ ] Implement the `clientLoader` in `app/routes/_index.tsx` to read API keys from `localStorage`.
    - [ ] Implement the `clientAction` in `app/routes/_index.tsx` to save API keys to `localStorage`.
4.  **UI Implementation**
    - [ ] Create the `ApiKeyModal.tsx` component with a `<fetcher.Form>` managed by `useFetcher`.
    - [ ] Add a provider selection UI to the main page.
    - [ ] Connect the UI to the `clientLoader` data and the `clientAction`.
5.  **Integration**
    - [ ] Wire the main component to trigger the AI completion flow using the factory and the selected client.
    - [ ] Handle the streamed response and display it in `SimpleQuestionDisplay.tsx`.
6.  **Cleanup**
    - [ ] Remove all obsolete WebLLM files (`webllm-client.ts`, `webllm-worker.ts`, etc.).
    - [ ] Uninstall the `@mlc-ai/web-llm` package.

## Active Decisions and Considerations

### Technical Decisions Made

1.  **AI Integration Strategy**: Multi-Provider "Bring Your Own Key" (BYOK).
    - **Reasoning**: Maximizes model quality and user flexibility while ensuring privacy. See ADR-0003.
2.  **Architecture**: Direct client-to-provider API calls.
    - **Reasoning**: Avoids server infrastructure costs and complexity. All data remains in the user's browser.
3.  **API Key Management**: Remix `clientLoader`/`clientAction` with `localStorage`.
    - **Reasoning**: Aligns with framework best practices for client-side state, ensuring a robust and maintainable implementation. See ADR-0004.
4.  **Modal Interactions**: `useFetcher` for the API key modal.
    - **Reasoning**: Provides a seamless UX for submitting data without a full page navigation.

### Open Questions

1.  **Error Handling**: How should we unify and display errors from different provider APIs (e.g., invalid key, rate limits, model errors)?
2.  **Model Selection**: Should we allow users to select specific models within a provider (e.g., GPT-4 vs. GPT-3.5)?
3.  **Key Encryption**: Should we consider client-side encryption for keys stored in `localStorage` as a future enhancement?

## Work Context

### Current Session Focus
- Quill editor implementation completed
- CSS organization pattern established
- Ready to continue with AI integration and question display

### Key Principles to Follow
- Domain-driven design approach
- Clean separation of concerns
- Comprehensive testing strategy
- Operator review at each stage
- Follow established CSS organization patterns

### Success Criteria
- ✅ Quill editor component implemented with proper styling
- ✅ CSS organization pattern documented
- 🚧 AI integration and question display (next)
- 🚧 Complete user flow implementation 