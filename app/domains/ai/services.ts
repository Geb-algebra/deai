import { Anthropic } from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { OpenAI } from "openai";
import type { LlmConfig } from "./models";
interface FocusedContentInput {
	focusedContent?: string;
	currentParagraph?: string;
	currentSection?: string;
	fullContent: string;
	markdownContent?: string;
}

export function buildPrompt(input: string | FocusedContentInput, previousQuestions: string[] = []) {
	// Handle backward compatibility with old string input
	const contentData =
		typeof input === "string"
			? {
					fullContent: input,
					markdownContent: input,
					focusedContent: input.slice(-300),
					currentParagraph: "",
					currentSection: "",
				}
			: input;

	const { focusedContent, currentParagraph, currentSection, markdownContent } = contentData;

	const previousQuestionsText =
		previousQuestions.length > 0
			? `\n\nこれまでにされた質問（重複しないように避けてください）:\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
			: "";

	// Use current line as primary focus (in markdown format)
	const primaryContent = focusedContent || ""; // Current 5-line window being edited

	const contextualInfo =
		currentSection && currentSection !== primaryContent
			? `\n\n現在のセクション:\n${currentSection}`
			: "";

	const fullContextInfo =
		markdownContent && markdownContent.length > 100
			? `\n\n文書全体: ${markdownContent.slice(0, 200)}${markdownContent.length > 200 ? "..." : ""}`
			: "";

	return `
あなたは多角的に考える洞察的なアシスタントです。

前提:
- 入力テキストの主言語を日本語または英語から特定してください。
- 入力が日本語の場合は、必ず日本語で質問を生成してください。
- 入力が英語の場合は、必ず英語で質問を生成してください。

タスク:
- ユーザーが現在書いている箇所（カーソル行とその前後2行ずつ、計5行）の内容を最優先に、以下のいずれかの観点から鋭く簡潔な質問（50文字以内）を1つ生成してください:
   - 現在編集中の箇所の内容について前提を問い直す
   - 書いている内容をより深掘りする
   - 現在の箇所に別の視点や角度を提示する
   - その箇所について新しい気づきを促す
- Markdownの構造（見出し、リスト、強調など）を理解して、文脈に応じた質問を生成してください
- 過去の質問と重複や類似がないようにしてください。${
		previousQuestions.length > 0 ? "\n- 以下のリストを参照して重複を避けてください。" : ""
	}
- 段落や文書全体の文脈は理解しつつも、現在編集している5行の範囲に最も関連性の高い質問を優先してください。

必要に応じて以下のような思考フレームワークを活用してください:
- 5W1H（Who, What, When, Where, Why, How）
- So what? / Why so? / Really?
- MECE（Mutually Exclusive, Collectively Exhaustive）
- ピラミッド構造（結論から問い直す）
- 逆説的な視点（あえて逆を問う）

出力形式:
- 質問文のみ（説明や前置き、前提、番号は不要）
- 文字数は50文字以内

現在編集中の箇所（5行）:
${primaryContent}${contextualInfo}${fullContextInfo}${previousQuestionsText}
`;
}

export async function generateQuestion(
	content: string | FocusedContentInput,
	llmConfig: LlmConfig,
	previousQuestions: string[] = [],
) {
	if (llmConfig.apiKey === "") {
		throw new Error("LLM config is not set");
	}
	console.log(buildPrompt(content, previousQuestions));
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
