import { type LlmConfig, LlmConfigSchema } from "./models";

export async function getLlmConfig(): Promise<LlmConfig> {
	const llmConfig = localStorage.getItem("llmConfig");
	if (!llmConfig) {
		throw new Error("LLM config not found");
	}
	return LlmConfigSchema.parse(JSON.parse(llmConfig));
}

export async function setLlmConfig(config: LlmConfig): Promise<void> {
	localStorage.setItem("llmConfig", JSON.stringify(config));
}
