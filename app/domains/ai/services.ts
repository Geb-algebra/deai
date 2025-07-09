import { Anthropic } from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { OpenAI } from "openai";
import type { LlmConfig } from "./models";
export function buildPrompt(content: string, previousQuestions: string[] = []) {
	const previousQuestionsText =
		previousQuestions.length > 0
			? `\n\nこれまでにされた質問（重複しないように避けてください）:\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
			: "";

	return `
あなたは多角的に考える洞察的なアシスタントです。

前提:
- 入力テキストの主言語を日本語または英語から特定してください。
- 入力が日本語の場合は、必ず日本語で質問を生成してください。
- 入力が英語の場合は、必ず英語で質問を生成してください。

タスク:
- 入力テキストについて以下のいずれかの観点から、鋭く簡潔な質問（50文字以内）を1つ生成してください:
   - 前提を問い直す
   - 深掘りして掘り下げる
   - 別の視点を提示する
   - 読み手にとって新しい気づきを促す
- 過去の質問と重複や類似がないようにしてください。${
		previousQuestions.length > 0 ? "\n- 以下のリストを参照して重複を避けてください。" : ""
	}

必要に応じて以下のような思考フレームワークを活用してください:
- 5W1H（Who, What, When, Where, Why, How）
- So what? / Why so? / Really?
- MECE（Mutually Exclusive, Collectively Exhaustive）
- ピラミッド構造（結論から問い直す）
- 逆説的な視点（あえて逆を問う）

出力形式:
- 質問文のみ（説明や前置き、前提、番号は不要）
- 文字数は50文字以内

テキスト: "${content}"${previousQuestionsText}
`;
}

export async function generateQuestion(
	content: string,
	llmConfig: LlmConfig,
	previousQuestions: string[] = [],
) {
	if (llmConfig.apiKey === "") {
		throw new Error("LLM config is not set");
	}
	switch (llmConfig.provider) {
		case "openai":
			return generateQuestionWithOpenAI(buildPrompt(content, previousQuestions), llmConfig);
		case "gemini":
			return generateQuestionWithGemini(buildPrompt(content, previousQuestions), llmConfig);
		case "claude":
			return generateQuestionWithClaude(buildPrompt(content, previousQuestions), llmConfig);
		default:
			throw new Error("Unsupported LLM provider");
	}
}

export async function generateQuestionWithOpenAI(content: string, llmConfig: LlmConfig) {
	const openai = new OpenAI({
		apiKey: llmConfig.apiKey,
		dangerouslyAllowBrowser: true,
	});
	const response = await openai.chat.completions.create({
		model: llmConfig.model,
		messages: [{ role: "user", content }],
	});

	return response.choices[0].message.content;
}

export async function generateQuestionWithGemini(content: string, llmConfig: LlmConfig) {
	const gemini = new GoogleGenerativeAI(llmConfig.apiKey);
	const model = gemini.getGenerativeModel({
		model: llmConfig.model,
	});
	const response = await model.generateContent(content);
	return response.response.text();
}

export async function generateQuestionWithClaude(content: string, llmConfig: LlmConfig) {
	const claude = new Anthropic({
		apiKey: llmConfig.apiKey,
		dangerouslyAllowBrowser: true,
	});
	const response = await claude.messages.create({
		model: llmConfig.model,
		messages: [{ role: "user", content }],
		max_tokens: 1000,
	});
	return response.content[0].type === "text" ? response.content[0].text : "";
}
