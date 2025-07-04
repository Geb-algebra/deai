# ADR 0001: WebLLM Integration

## Status

Accepted

## Context

We integrated WebLLM into our application but its performance did not meet our demand.

Lightweight models (under 3B parameters) were unable to generate meaningful questions from user input, and larger models (7B, 8B) failed to respond --- likely due to hardware limitations on my PC.
Additionally, long initial load times and UI lag during inference significantly degraded the overall user experience.

## Key Decisions

We stop using WebLLM and switched to provider-hosted, higher-performance models via LLM APIs.

For preserving users' privacy and saving costs, we may need to use BYOK strategy to avoid forcing users send their data to our server.

## Consequences



## Related Decisions

- None

## References
