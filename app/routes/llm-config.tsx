import { useState } from "react";
import { data, useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { type LlmConfig, LlmConfigSchema, type ModelProvider } from "~/domains/ai";
import { AI_MODELS } from "~/domains/ai/constants";
import { setLlmConfig } from "~/domains/ai/repositories";
import type { Route } from "./+types/llm-config";

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

export function LlmConfigurer({ llmConfig }: { llmConfig: LlmConfig }) {
	const configFetcher = useFetcher<typeof clientAction>();
	const { error } = configFetcher.data ?? { error: null };
	const [provider, setProvider] = useState<ModelProvider>(llmConfig?.provider ?? "gemini");

	return (
		<div className="p-4 border rounded-2xl bg-card">
			<div className="flex items-center justify-between mb-2">
				<h3 className="text-sm font-medium">Current AI Configuration</h3>

				<Dialog defaultOpen={llmConfig?.apiKey === ""}>
					<DialogTrigger asChild>
						<Button variant="outline" size="sm">
							Change Config
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Configure AI Provider</DialogTitle>
							<DialogDescription>
								Enter your API key to enable AI-powered question generation.
							</DialogDescription>
						</DialogHeader>

						<configFetcher.Form action="/llm-config" method="post" className="space-y-4">
							<Label htmlFor="provider">Provider</Label>
							<Select
								name="provider"
								defaultValue={llmConfig?.provider}
								onValueChange={(value) => setProvider(value as ModelProvider)}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select a provider" />
								</SelectTrigger>
								<SelectContent className="w-full">
									<SelectItem value="gemini">Gemini</SelectItem>
									<SelectItem value="openai">OpenAI</SelectItem>
									<SelectItem value="claude">Claude</SelectItem>
								</SelectContent>
							</Select>
							<Label htmlFor="model">Model</Label>
							<Select name="model" defaultValue={llmConfig?.model}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select a model" />
								</SelectTrigger>
								<SelectContent className="w-full">
									{AI_MODELS[provider].map((model) => (
										<SelectItem key={model} value={model}>
											{model}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Label htmlFor="apiKey">API Key</Label>
							<Input name="apiKey" defaultValue={llmConfig?.apiKey} />
							<DialogClose asChild>
								<Button type="submit">Save</Button>
							</DialogClose>
						</configFetcher.Form>
						{error && <p className="text-sm text-red-500">{error}</p>}
					</DialogContent>
				</Dialog>
			</div>
			<div className="space-y-1 text-xs text-muted-foreground">
				<div className="flex justify-between">
					<span>Provider:</span>
					<span className="capitalize">{llmConfig?.provider}</span>
				</div>
				<div className="flex justify-between">
					<span>Model:</span>
					<span className="capitalize">{llmConfig?.model}</span>
				</div>
				<div className="flex justify-between">
					<span>API Key:</span>
					<span>{llmConfig?.apiKey ? "✓ Configured" : "✗ Not set"}</span>
				</div>
			</div>
		</div>
	);
}
