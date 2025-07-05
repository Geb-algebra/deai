import type { AIRequest, AIResponse, LlmConfig } from "./models";

// Factory for creating AIRequest objects
export function createAIRequest(content: string): AIRequest {
	return {
		content,
		timestamp: new Date(),
	};
}

// Factory for creating AIResponse objects
export function createAIResponse(
	questions: string[],
	success: boolean,
	error?: string,
): AIResponse {
	return {
		questions,
		timestamp: new Date(),
		success,
		error,
	};
}

export function createDefaultLlmConfig(): LlmConfig {
	return {
		provider: "gemini",
		apiKey: "",
	};
}
