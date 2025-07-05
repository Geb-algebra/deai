import { useFetcher, useLoaderData } from "react-router";
import { Button } from "~/components/atoms/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/atoms/dialog";
import { Input } from "~/components/atoms/input";
import { Label } from "~/components/atoms/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/atoms/select";
import type { clientAction, clientLoader } from "./_index";

export function LlmConfig() {
	const llmConfig = useLoaderData<typeof clientLoader>();
	const configFetcher = useFetcher<typeof clientAction>();
	const { error } = configFetcher.data ?? { error: null };

	return (
		<div className="p-4 border rounded-lg bg-card">
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

						<configFetcher.Form method="post" className="space-y-4">
							<Label htmlFor="provider">Provider</Label>
							<Select name="provider" defaultValue={llmConfig?.provider}>
								<SelectTrigger>
									<SelectValue placeholder="Select a provider" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="gemini">Gemini</SelectItem>
									<SelectItem value="openai">OpenAI</SelectItem>
									<SelectItem value="claude">Claude</SelectItem>
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
					<span>API Key:</span>
					<span>{llmConfig?.apiKey ? "✓ Configured" : "✗ Not set"}</span>
				</div>
			</div>
		</div>
	);
}
