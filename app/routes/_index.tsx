import { MoonIcon, SunIcon } from "lucide-react";
import { useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { QuillEditor } from "~/components/QuillEditor.client";
import { Switch } from "~/components/atoms/switch";
import { useTheme } from "~/context";
import { cn } from "~/utils/css";
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
	const [aiQuestions, setAiQuestions] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const handleContentChange = (content: string) => {
		// Handle content changes - could be used for real-time features
		console.log("Content changed:", content);
	};

	const handleIdle = async (content: string) => {
		// This is where we would integrate with AI to generate questions
		// For now, we'll simulate the AI response
		setIsLoading(true);

		// Simulate AI processing delay
		setTimeout(() => {
			const mockQuestions = [
				"What are the underlying assumptions in your thinking?",
				"How might someone with a different perspective view this?",
				"What would be the next logical step to explore this further?",
			];
			setAiQuestions(mockQuestions);
			setIsLoading(false);
		}, 2000);
	};

	return (
		<div className={cn("h-full bg-background", styles.root)}>
			{/* Header with theme toggle */}
			<header className="flex items-center justify-between p-4 border-b">
				<h1 className="text-xl font-semibold">🧠 Thought-Expanding AI Assist Editor</h1>
				<div className="flex items-center space-x-2">
					<SunIcon size={16} />
					<Switch
						id="airplane-mode"
						checked={theme === "dark"}
						onCheckedChange={(checked) => {
							setTheme(checked ? "dark" : "light");
						}}
					/>
					<MoonIcon size={16} />
				</div>
			</header>

			{/* Main content */}
			<main className={cn("container mx-auto p-6 h-full", styles.main)}>
				{/* Editor section */}
				<section className="mb-8 h-full">
					<ClientOnly fallback={<div>Loading...</div>}>
						{() => (
							<QuillEditor
								placeholder="Start writing your thoughts freely... Use bullet points, paragraphs, or any format that helps you think."
								onContentChange={handleContentChange}
								onIdle={handleIdle}
								idleTimeout={5000}
							/>
						)}
					</ClientOnly>
				</section>

				{/* AI Questions section */}
				{isLoading && (
					<section className="mb-6">
						<div className="text-center text-muted-foreground">
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2" />
							<p>AI is analyzing your thoughts...</p>
						</div>
					</section>
				)}

				{aiQuestions.length > 0 && (
					<section className="mb-6">
						<h2 className="text-lg font-semibold mb-4 text-primary">
							🤔 AI prompts to expand your thinking:
						</h2>
						<div className="bg-muted/50 rounded-lg p-4">
							<ul className="space-y-2">
								{aiQuestions.map((question, index) => (
									<li
										key={`question-${index}-${question.slice(0, 10)}`}
										className="flex items-start space-x-2"
									>
										<span className="text-primary mt-1">•</span>
										<span className="text-foreground">{question}</span>
									</li>
								))}
							</ul>
						</div>
					</section>
				)}

				{/* Instructions */}
				<section className="text-center text-sm text-muted-foreground">
					<p>
						Write your thoughts freely. After 5 seconds of inactivity, AI will analyze your content
						and suggest questions to help expand your thinking.
					</p>
				</section>
			</main>
		</div>
	);
}
