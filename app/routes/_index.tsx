import type { Route } from "./+types/_index";

import { MoonIcon, SunIcon } from "lucide-react";
import { useFetcher } from "react-router";
import { ClientOnly } from "remix-utils/client-only";
import { z } from "zod";
import { QuillEditor } from "~/components/QuillEditor.client";
import { Switch } from "~/components/atoms/switch";
import { useTheme } from "~/context";
import { createDefaultLlmConfig } from "~/domains/ai";
import { getLlmConfig } from "~/domains/ai/repositories";
import { generateQuestion } from "~/domains/ai/services";
import { cn } from "~/utils/css";
import styles from "./_index.module.css";
import { LlmConfig } from "./llm-config";

export function meta() {
	return [
		{ title: "Thought-Expanding AI Assist Editor" },
		{
			name: "description",
			content: "Write your thoughts and get AI-powered questions to expand your thinking",
		},
	];
}

export async function clientLoader() {
	try {
		const llmConfig = await getLlmConfig();
		return llmConfig;
	} catch (error) {
		return createDefaultLlmConfig();
	}
}

const QuestionerSchema = z.object({
	content: z.string().min(1, "Content is required"),
	previousQuestions: z.array(z.string()).optional().default([]),
});

export async function clientAction({ request }: Route.ClientActionArgs) {
	const llmConfig = await getLlmConfig();
	const formData = await request.json();
	const { content, previousQuestions } = QuestionerSchema.parse(formData);
	const question = await generateQuestion(content, previousQuestions, llmConfig);
	if (!question) {
		return previousQuestions;
	}
	const newQuestions = [...previousQuestions, question].slice(-10);
	return newQuestions;
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const { theme, setTheme } = useTheme();
	const fetcher = useFetcher<typeof clientAction>();
	const questions = fetcher.data;
	console.log(questions);

	const toggleTheme = () => {
		setTheme(theme === "light" ? "dark" : "light");
	};

	return (
		<div className={cn("h-full bg-background", styles.root, theme)}>
			{/* Header with theme toggle */}
			<header className="flex items-center justify-between p-4 border-b">
				<h1 className="text-xl font-semibold">🧠 Thought-Expanding AI Assist Editor</h1>
				<div className="flex items-center space-x-2">
					<SunIcon size={16} />
					<Switch id="airplane-mode" checked={theme === "dark"} onCheckedChange={toggleTheme} />
					<MoonIcon size={16} />
				</div>
			</header>

			{/* Main content */}
			<main className={cn("container mx-auto p-6 h-full", styles.main)}>
				{/* Editor section */}
				<section className="mb-8 h-full">
					<ClientOnly fallback={<div className={styles.quillSkeleton} />}>
						{() => (
							<QuillEditor
								placeholder="Start writing your thoughts freely... Use bullet points, paragraphs, or any format that helps you think."
								onIdle={(content) => {
									fetcher.submit(
										{ content, previousQuestions: questions || [] },
										{ method: "post", encType: "application/json" },
									);
								}}
							/>
						)}
					</ClientOnly>
				</section>

				<aside className={styles.sidebar}>
					<LlmConfig />
					<div className="flex flex-col gap-2">
						{questions?.map((question, index) => (
							<div key={index}>{question}</div>
						))}
						{fetcher.state === "submitting" && <div>Generating...</div>}
						{fetcher.state === "loading" && <div>Loading...</div>}
						{fetcher.state === "idle" && <div>Idle</div>}
					</div>
				</aside>
			</main>
		</div>
	);
}
