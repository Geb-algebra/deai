import { Anthropic } from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { OpenAI } from "openai";
import type { LlmConfig } from "./models";

export function buildPrompt(content: string, previousQuestions: string[] = []) {
	const previousQuestionsText =
		previousQuestions.length > 0
			? `\n\nPreviously asked questions (avoid repeating these):\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
			: "";

	return `
First, identify the main language of the following text.
Then, respond in that same language with a single, thought-provoking question that challenges its underlying assumptions. 
${previousQuestions.length > 0 ? "Make sure your question is different from the previously asked questions listed below." : ""}
Respond with only the question itself, without any preamble or numbering.

Text: "${content}"${previousQuestionsText}
`;
}

export async function generateQuestion(
	content: string,
	previousQuestions: string[] = [],
	llmConfig: LlmConfig,
) {
	if (llmConfig.apiKey === "") {
		throw new Error("LLM config is not set");
	}
	switch (llmConfig.provider) {
		case "openai":
			return generateQuestionWithOpenAI(buildPrompt(content, previousQuestions), llmConfig.apiKey);
		case "gemini":
			return generateQuestionWithGemini(buildPrompt(content, previousQuestions), llmConfig.apiKey);
		case "claude":
			return generateQuestionWithClaude(buildPrompt(content, previousQuestions), llmConfig.apiKey);
		default:
			throw new Error("Unsupported LLM provider");
	}
}

export async function generateQuestionWithOpenAI(content: string, apiKey: string) {
	const openai = new OpenAI({
		apiKey,
		dangerouslyAllowBrowser: true,
	});
	const response = await openai.chat.completions.create({
		model: "gpt-4o-mini",
		messages: [{ role: "user", content }],
	});

	return response.choices[0].message.content;
}

export async function generateQuestionWithGemini(content: string, apiKey: string) {
	const gemini = new GoogleGenerativeAI(apiKey);
	const model = gemini.getGenerativeModel({
		model: "gemini-2.0-flash",
	});
	const response = await model.generateContent(content);
	return response.response.text();
}

export async function generateQuestionWithClaude(content: string, apiKey: string) {
	const claude = new Anthropic({
		apiKey,
		dangerouslyAllowBrowser: true,
	});
	const response = await claude.messages.create({
		model: "claude-3-haiku-20240307",
		messages: [{ role: "user", content }],
		max_tokens: 1000,
	});
	return response.content[0].type === "text" ? response.content[0].text : "";
}
