import * as webllm from "@mlc-ai/web-llm";
import type {
	GenerateQuestionsPayload,
	ProgressUpdate,
	QuestionsResponse,
	StatusResponse,
	WorkerMessage,
	WorkerResponse,
} from "./types";

// Define Progress type correctly
interface Progress {
	progress: number;
	text: string;
}

// Worker state management
class WebLLMWorkerState {
	private engine: webllm.MLCEngine | null = null;
	private modelLoaded = false;
	private isLoading = false;
	private error: string | null = null;

	// Use a smaller, faster model for real-time questioning
	private readonly MODEL_ID = "Llama-3.2-3B-Instruct-q4f32_1-MLC";

	async loadModel(): Promise<void> {
		if (this.modelLoaded || this.isLoading) {
			return;
		}

		try {
			this.isLoading = true;
			this.error = null;

			// Initialize WebLLM engine
			this.engine = new webllm.MLCEngine();

			this.engine.setInitProgressCallback((report: webllm.InitProgressReport) => {
				const progressUpdate: ProgressUpdate = {
					progress: report.progress,
					text: report.text,
				};

				// Regex to parse "Fetching model weights (1.23/100.00 MB)"
				const downloadRegex = /\(([\d\.]+)\/([\d\.]+) MB\)/;
				const match = report.text.match(downloadRegex);

				if (match) {
					const loaded = Number.parseFloat(match[1]);
					const total = Number.parseFloat(match[2]);
					if (!Number.isNaN(loaded) && !Number.isNaN(total) && total > 0) {
						progressUpdate.progress = loaded / total;
						progressUpdate.loadedMB = loaded;
						progressUpdate.totalMB = total;
					}
				}

				const response: WorkerResponse = {
					id: "progress",
					type: "progress-update",
					success: true,
					data: progressUpdate,
				};

				self.postMessage(response);
			});

			// Load model
			await this.engine.reload(this.MODEL_ID);

			this.modelLoaded = true;
			this.isLoading = false;
		} catch (error) {
			this.isLoading = false;
			this.error = error instanceof Error ? error.message : "Unknown error";
			throw error;
		}
	}

	async generateQuestions(editorContent: string): Promise<QuestionsResponse> {
		if (!this.engine || !this.modelLoaded) {
			throw new Error("Model not loaded");
		}

		const startTime = Date.now();
		const llmPrompt = `First, identify the main language of the following text. Then, respond in that same language with a single, thought-provoking question that challenges its underlying assumptions. Respond with only the question itself, without any preamble or numbering.\n\nText: "${editorContent}"`;

		try {
			const response = await this.engine.chat.completions.create({
				messages: [
					{
						role: "user",
						content: llmPrompt,
					},
				],
				temperature: 0.7,
				max_tokens: 100,
			});

			const content = response.choices[0]?.message?.content?.trim() || "";
			const processingTime = Date.now() - startTime;

			return {
				question: content,
				processingTime,
			};
		} catch (error) {
			throw new Error(
				`Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	getStatus(): StatusResponse {
		return {
			ready: this.modelLoaded,
			modelLoaded: this.modelLoaded,
			error: this.error || undefined,
		};
	}
}

// Initialize worker state
const workerState = new WebLLMWorkerState();

// Handle messages from main thread
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
	const { id, type, payload } = event.data;

	try {
		switch (type) {
			case "load-model": {
				await workerState.loadModel();

				const response: WorkerResponse = {
					id,
					type: "model-loaded",
					success: true,
					data: workerState.getStatus(),
				};

				self.postMessage(response);
				break;
			}

			case "generate-questions": {
				const { prompt } = payload as GenerateQuestionsPayload;
				const result = await workerState.generateQuestions(prompt);

				const response: WorkerResponse = {
					id,
					type: "questions-generated",
					success: true,
					data: result,
				};

				self.postMessage(response);
				break;
			}

			case "get-status": {
				const status = workerState.getStatus();

				const response: WorkerResponse = {
					id,
					type: "status-response",
					success: true,
					data: status,
				};

				self.postMessage(response);
				break;
			}

			default: {
				const response: WorkerResponse = {
					id,
					type: "error",
					success: false,
					error: `Unknown message type: ${type}`,
				};

				self.postMessage(response);
			}
		}
	} catch (error) {
		const response: WorkerResponse = {
			id,
			type: "error",
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};

		self.postMessage(response);
	}
};

// Handle worker errors
self.onerror = (
	event: Event | string,
	source?: string,
	lineno?: number,
	colno?: number,
	error?: Error,
) => {
	const errorMessage = typeof event === "string" ? event : error?.message || "Unknown error";
	const response: WorkerResponse = {
		id: "worker-error",
		type: "error",
		success: false,
		error: `Worker error: ${errorMessage}`,
	};

	self.postMessage(response);
};
