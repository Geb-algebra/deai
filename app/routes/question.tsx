import { z } from "zod";
import { getLlmConfig } from "~/domains/ai/repositories";
import { generateQuestion } from "~/domains/ai/services";
import type { Route } from "./+types/question";

const QuestionerSchema = z.object({
	content: z.string().min(1, "Content is required"),
	previousQuestions: z.array(z.string()).optional().default([]),
});

export async function clientAction({ request }: Route.ClientActionArgs) {
	const formData = await request.json();
	const { content, previousQuestions } = QuestionerSchema.parse(formData);
	const llmConfig = await getLlmConfig();
	if (!llmConfig.apiKey) {
		return { questions: previousQuestions, error: "LLM config is not set" };
	}
	const question = await generateQuestion(content, previousQuestions, llmConfig);
	if (!question) {
		return { questions: previousQuestions, error: "Failed to generate question" };
	}
	const newQuestions = [...previousQuestions, question].slice(-10);
	return { questions: newQuestions, error: null };
}
