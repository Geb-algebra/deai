// Shared types between main thread and worker
export interface WorkerMessage {
	id: string;
	type: WorkerMessageType;
	payload?: unknown;
}

export interface WorkerResponse {
	id: string;
	type: WorkerResponseType;
	success: boolean;
	data?: unknown;
	error?: string;
}

export type WorkerMessageType = "load-model" | "generate-questions" | "get-status";

export type WorkerResponseType =
	| "model-loaded"
	| "questions-generated"
	| "status-response"
	| "progress-update"
	| "error";

export interface GenerateQuestionsPayload {
	prompt: string;
}

export interface QuestionsResponse {
	question: string;
	processingTime: number;
}

export interface StatusResponse {
	ready: boolean;
	modelLoaded: boolean;
	error?: string;
}

export interface ProgressUpdate {
	progress: number; // 0-1
	text: string;
	loadedMB?: number;
	totalMB?: number;
}
