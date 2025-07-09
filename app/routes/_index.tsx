import type { Route } from "./+types/_index";

import { MoonIcon, SunIcon } from "lucide-react";
import { useFetcher } from "react-router";
import { ClientOnly } from "remix-utils/client-only";
import { QuillEditor } from "~/components/QuillEditor.client";
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
	try {
		const llmConfig = await getLlmConfig();
		return { llmConfig, content };
	} catch (error) {
		return { llmConfig: createDefaultLlmConfig(), content };
	}
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const { theme, setTheme } = useTheme();
	const questionFetcher = useFetcher<typeof questionAction>();
	const contentFetcher = useFetcher<typeof contentAction>();
	const { content, llmConfig } = loaderData;
	const { questions, error } = questionFetcher.data || { questions: [], error: null };

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
				className={cn("mx-auto p-6 h-full w-full max-w-screen-xl overflow-y-hidden", styles.main)}
			>
				{/* Editor section */}
				<section className="mb-8 h-full w-full overflow-y-hidden">
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

				<aside className={cn(styles.sidebar, "h-full")}>
					<LlmConfigurer llmConfig={llmConfig} />
					<div className="flex flex-col gap-2 justify-end overflow-y-auto">
						{questions?.map((question) => (
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
