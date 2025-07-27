import { z } from "zod";
import { getLlmConfig } from "~/domains/ai/repositories";
import { generateQuestion } from "~/domains/ai/services";
import type { Route } from "./+types/question";

const QuestionerSchema = z.object({
	content: z.string().min(1, "Content is required"),
	markdownContent: z.string().optional().default(""),
	focusedContent: z.string().optional(),
	currentParagraph: z.string().optional(),
	currentSection: z.string().optional(),
	previousQuestions: z.array(z.string()).optional().default([]),
});

export async function clientAction({ request }: Route.ClientActionArgs) {
	if (request.method === "DELETE") {
		localStorage.removeItem("previousQuestions");
		return { questions: [], error: null };
	}

	const formData = await request.json();
	const {
		content,
		markdownContent,
		focusedContent,
		currentParagraph,
		currentSection,
		previousQuestions,
	} = QuestionerSchema.parse(formData);
	const llmConfig = await getLlmConfig();
	if (!llmConfig.apiKey) {
		return { questions: previousQuestions, error: "LLM config is not set" };
	}

	// Create focused content input for the AI
	const contentInput = {
		fullContent: content,
		markdownContent,
		focusedContent,
		currentParagraph,
		currentSection,
	};

	const question = await generateQuestion(contentInput, llmConfig, previousQuestions);
	if (!question) {
		return { questions: previousQuestions, error: "Failed to generate question" };
	}
	const newQuestions = [...previousQuestions, question].slice(-10);
	localStorage.setItem("previousQuestions", JSON.stringify(newQuestions));
	return { questions: newQuestions, error: null };
}
