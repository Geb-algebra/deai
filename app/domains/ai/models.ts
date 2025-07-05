import { z } from "zod";

// AI models for handling requests and responses
export type AIRequest = {
	readonly content: string;
	readonly timestamp: Date;
};

export type AIResponse = {
	readonly questions: string[];
	readonly timestamp: Date;
	readonly success: boolean;
	readonly error?: string;
};

export type ModelStatus = "loading" | "ready" | "error";

export type ModelProvider = "gemini" | "openai" | "claude";

export const LlmConfigSchema = z.object({
	provider: z.enum(["gemini", "openai", "claude"]),
	apiKey: z.string().min(1, "API key is required"),
});

export type LlmConfig = z.infer<typeof LlmConfigSchema>;
