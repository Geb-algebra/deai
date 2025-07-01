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
