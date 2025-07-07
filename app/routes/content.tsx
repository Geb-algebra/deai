import type { Route } from "./+types/content";

export async function clientAction({ request }: Route.ClientActionArgs) {
	const { content } = await request.json();
	if (!content) {
		return { error: "Content is required" };
	}
	localStorage.setItem("content", content);
	return { error: null };
}
