import type { Route } from "./+types/_index";

import { MoonIcon, SunIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { data } from "react-router";
import { ClientOnly } from "remix-utils/client-only";
import { QuillEditor } from "~/components/QuillEditor.client";
import { Switch } from "~/components/atoms/switch";
import { useTheme } from "~/context";
import { LlmConfigSchema, createDefaultLlmConfig } from "~/domains/ai";
import { getLlmConfig, setLlmConfig } from "~/domains/ai/repositories";
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

export async function clientAction({ request }: Route.ClientActionArgs) {
	const formData = await request.formData();
	try {
		const llmConfig = LlmConfigSchema.parse(Object.fromEntries(formData));
		await setLlmConfig(llmConfig);
		return { error: null };
	} catch (error) {
		return data({ error: "Invalid LLM config" }, { status: 400 });
	}
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const { theme, setTheme } = useTheme();
	const [content, setContent] = useState<string>("");
	const [isIdle, setIsIdle] = useState(false);

	const handleContentChange = (newContent: string) => {
		setContent(newContent);
		setIsIdle(false);
	};

	const handleIdle = useCallback(() => {
		setIsIdle(true);
	}, []);

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
								onContentChange={handleContentChange}
								onIdle={handleIdle}
							/>
						)}
					</ClientOnly>
				</section>

				<aside className={styles.sidebar}>
					<LlmConfig />
				</aside>
			</main>
		</div>
	);
}
