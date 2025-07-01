import type {
	GenerateQuestionsPayload,
	ProgressUpdate,
	WorkerMessage,
	WorkerResponse,
} from "../../workers/types";

// WebLLM client for worker communication
export class WebLLMClient {
	private worker: Worker;

	constructor() {
		this.worker = new Worker(new URL("../../workers/webllm-worker.ts", import.meta.url), {
			type: "module",
		});
	}

	async loadModel(onProgress?: (progress: ProgressUpdate) => void): Promise<void> {
		const message: WorkerMessage = {
			id: "load-model",
			type: "load-model",
		};
		this.worker.postMessage(message);

		return new Promise((resolve, reject) => {
			this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
				const { id, type, success, data, error } = event.data;

				if (type === "progress-update" && onProgress) {
					onProgress(data as ProgressUpdate);
					return;
				}

				if (id === "load-model") {
					if (success) {
						resolve();
					} else {
						reject(new Error(error));
					}
				}
			};
		});
	}

	async generateQuestions(prompt: string): Promise<string> {
		const payload: GenerateQuestionsPayload = { prompt };
		const message: WorkerMessage = {
			id: "generate-questions",
			type: "generate-questions",
			payload,
		};
		this.worker.postMessage(message);

		return new Promise((resolve, reject) => {
			this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
				const { type, success, data, error } = event.data;
				if (type === "questions-generated" && success) {
					resolve((data as { question: string }).question);
				} else if (type === "error") {
					reject(new Error(error));
				}
			};
		});
	}

	getStatus(): Promise<boolean> {
		const message: WorkerMessage = {
			id: "get-status",
			type: "get-status",
		};
		this.worker.postMessage(message);

		return new Promise((resolve) => {
			this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
				const { type, success, data } = event.data;
				if (type === "status-response" && success) {
					resolve((data as { ready: boolean }).ready);
				}
			};
		});
	}
}
