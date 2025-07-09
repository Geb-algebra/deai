import type { Route } from "./+types/_index";

import { MoonIcon, SunIcon, Trash2 } from "lucide-react";
import { useFetcher } from "react-router";
import { ClientOnly } from "remix-utils/client-only";
import { QuillEditor } from "~/components/QuillEditor.client";
import { Button } from "~/components/atoms/Button";
import { Switch } from "~/components/atoms/switch";
import { useTheme } from "~/context";
import { createDefaultLlmConfig } from "~/domains/ai";
import { getLlmConfig } from "~/domains/ai/repositories";
import { cn } from "~/utils/css";
import styles from "./_index.module.css";
import type { clientAction as contentAction } from "./content";
import { LlmConfigurer } from "./llm-config";
import type { clientAction as questionAction } from "./question";

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
	const content = localStorage.getItem("content") || "[]";
	const savedQuestions = localStorage.getItem("previousQuestions");
	const questions = savedQuestions ? JSON.parse(savedQuestions) : [];
	try {
		const llmConfig = await getLlmConfig();
		return { llmConfig, content, questions };
	} catch (error) {
		return { llmConfig: createDefaultLlmConfig(), content, questions };
	}
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const { theme, setTheme } = useTheme();
	const questionFetcher = useFetcher<typeof questionAction>();
	const contentFetcher = useFetcher<typeof contentAction>();
	const { content, llmConfig, questions: initialQuestions } = loaderData;
	const { questions, error } = questionFetcher.data || {
		questions: initialQuestions,
		error: null,
	};

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
			<main
				className={cn("mx-auto p-6 h-full w-full max-w-screen-xl overflow-y-auto", styles.main)}
			>
				{/* Editor section */}
				<section className="mb-8 h-full w-full overflow-y-auto">
					<ClientOnly fallback={<div className={styles.quillSkeleton} />}>
						{() => (
							<QuillEditor
								content={content}
								placeholder="Start writing your thoughts freely... Use bullet points, paragraphs, or any format that helps you think."
								onContentChange={({ content }) => {
									contentFetcher.submit(
										{ content },
										{
											method: "post",
											action: "/content",
											encType: "application/json",
										},
									);
								}}
								onIdle={({ plainText }) => {
									questionFetcher.submit(
										{ content: plainText, previousQuestions: questions || [] },
										{ method: "post", action: "/question", encType: "application/json" },
									);
								}}
							/>
						)}
					</ClientOnly>
				</section>

				<aside className={cn(styles.sidebar, "h-full overflow-y-auto")}>
					<LlmConfigurer llmConfig={llmConfig} />
					<questionFetcher.Form
						className="flex items-center justify-between p-1"
						method="delete"
						action="/question"
					>
						<h2 className="text-sm font-semibold">AI Generated Questions</h2>
						<Button
							variant="ghost"
							size="icon"
							type="submit"
							disabled={!questions || questions.length === 0 || questionFetcher.state !== "idle"}
						>
							<Trash2 />
						</Button>
					</questionFetcher.Form>
					<div className="flex flex-col gap-2 overflow-y-scroll justify-end-safe">
						{questions?.map((question: string) => (
							<div className="rounded-2xl bg-secondary p-3" key={question}>
								<p className="text-sm">{question}</p>
							</div>
						))}
						{questionFetcher.state === "submitting" && <div>Generating...</div>}
						{questionFetcher.state === "loading" && <div>Loading...</div>}
						{questionFetcher.state === "idle" && <div>{error}</div>}
					</div>
				</aside>
			</main>
		</div>
	);
}
