import type { Route } from "./+types/content";

export async function clientAction({ request }: Route.ClientActionArgs) {
	const data = (await request.json()) as { content?: string };
	const { content } = data;
	if (!content) {
		return { error: "Content is required" };
	}
	localStorage.setItem("content", content);
	return { error: null };
}
