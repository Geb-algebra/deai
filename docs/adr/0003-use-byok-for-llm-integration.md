# ADR: Use "Bring Your Own Key" (BYOK) for LLM Integration

## Status

Accepted

## Context

We are integrating LLM functionality into a web application that helps users expand their thinking based on inputted idea fragments (e.g., bullet points or notes). User privacy is a high priority, and we want to avoid routing user data through our own server. 

Previously considered alternatives include:

- **Running lightweight LLMs in the browser (e.g., WebLLM):**
  - ✅ Preserves privacy
  - ❌ Poor model quality (<3B)
  - ❌ Heavy models (7B+) cause unacceptable performance issues on typical user devices
  - ❌ Long loading times and UI freezes lead to poor UX

- **Calling provider-hosted LLMs through our backend:**
  - ✅ Good model quality
  - ❌ Involves user data flowing through our server, which we want to avoid

## Decision

We will adopt a **Bring Your Own Key (BYOK)** strategy.

Users will be able to:
- Input their own API keys for a supported LLM provider (e.g., OpenAI)
- Have their keys stored locally in the browser (e.g., `localStorage`, in-memory)
- Make LLM API calls directly from the client to the LLM provider
- Avoid sending any prompt data to our backend servers

## Consequences

### Pros

- No user prompt data is sent to our servers
- High model quality via hosted APIs (e.g., GPT-4)
- Better performance and responsiveness than local models
- Avoids infrastructure cost and complexity of hosting/proxying LLMs

### Cons

- Slightly more complex onboarding (users must obtain and paste their own API keys)
- Requires extra client-side error handling (e.g., invalid keys, rate limits)
- Users must trust the third-party provider (e.g., OpenAI) with their data

## Future Considerations

We may offer:
- Secure server-side token proxying for non-technical users who prefer not to manage API keys
- Support for multiple LLM providers via a plug-and-play frontend integration
- Encrypted local key storage (e.g., via IndexedDB + Web Crypto)

## Related Decisions

- LLM inference will be streamed for better UI responsiveness
- API key will not be persisted on our servers under any circumstance
