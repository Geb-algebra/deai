import { MoonIcon, SunIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { QuillEditor } from "~/components/QuillEditor.client";
import { Switch } from "~/components/atoms/switch";
import { useTheme } from "~/context";
import { cn } from "~/utils/css";
import type { ProgressUpdate } from "~/workers/types";
import SimpleQuestionDisplay from "../components/SimpleQuestionDisplay";
import { WebLLMClient } from "../domains/ai/webllm-client";
import styles from "./_index.module.css";

export async function loader() {
	console.log("hello from loader");
	return null;
}

export function meta() {
	return [
		{ title: "Thought-Expanding AI Assist Editor" },
		{
			name: "description",
			content: "Write your thoughts and get AI-powered questions to expand your thinking",
		},
	];
}

export default function Home() {
	const { theme, setTheme } = useTheme();
	const [content, setContent] = useState<string>("");
	const [isIdle, setIsIdle] = useState(false);

	// WebLLM State
	const clientRef = useRef<WebLLMClient | null>(null);
	const [modelLoading, setModelLoading] = useState(true);
	const [progress, setProgress] = useState<ProgressUpdate | null>(null);
	const [elapsedTime, setElapsedTime] = useState(0);
	const [aiQuestion, setAiQuestion] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Initialize WebLLM Client and load model
	useEffect(() => {
		if (!clientRef.current) {
			clientRef.current = new WebLLMClient();
		}

		const startTime = Date.now();
		const timer = setInterval(() => {
			setElapsedTime((Date.now() - startTime) / 1000);
		}, 100);

		const loadModel = async () => {
			try {
				await clientRef.current?.loadModel((progressUpdate) => {
					setProgress(progressUpdate);
				});
				setModelLoading(false);
				clearInterval(timer);
			} catch (err) {
				setError("Failed to load model");
				setModelLoading(false);
				clearInterval(timer);
			}
		};

		loadModel();

		return () => clearInterval(timer);
	}, []);

	// Handle idle state to generate questions
	useEffect(() => {
		if (isIdle && content && !isGenerating && !modelLoading) {
			const generate = async () => {
				setIsGenerating(true);
				setError(null);
				try {
					const question = await clientRef.current?.generateQuestions(content);
					setAiQuestion(question || "");
				} catch (err) {
					setError("Failed to generate questions.");
					console.error(err);
				} finally {
					setIsGenerating(false);
					setIsIdle(false); // Reset idle state
				}
			};
			generate();
		}
	}, [isIdle, content, isGenerating, modelLoading]);

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

				{/* AI Questions section */}
				{modelLoading && (
					<section className="mb-6">
						<div className="text-center text-muted-foreground">
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2" />
							<p>AI is analyzing your thoughts...</p>
						</div>
					</section>
				)}

				{aiQuestion && (
					<section className="mb-6">
						<h2 className="text-lg font-semibold mb-4 text-primary">
							🤔 AI prompt to expand your thinking:
						</h2>
						<div className="bg-muted/50 rounded-lg p-4">
							<p className="text-foreground">{aiQuestion}</p>
						</div>
					</section>
				)}

				{/* Instructions */}
				<section className="text-center text-sm text-muted-foreground">
					<p>
						Write your thoughts freely. After 5 seconds of inactivity, AI will analyze your content
						and suggest a question to help expand your thinking.
					</p>
				</section>

				<aside className={styles.sidebar}>
					<SimpleQuestionDisplay
						modelLoading={modelLoading}
						progress={progress}
						elapsedTime={elapsedTime}
						question={aiQuestion}
						isGenerating={isGenerating}
						error={error}
					/>
				</aside>
			</main>
		</div>
	);
}
