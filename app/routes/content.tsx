import type { Route } from "./+types/content";

export async function clientAction({ request }: Route.ClientActionArgs) {
	const formData = await request.formData();
	const content = formData.get("content");
	if (!content) {
		return { error: "Content is required" };
	}
	if (typeof content !== "string") {
		return { error: "Content must be a string" };
	}
	localStorage.setItem("content", content);
	return { error: null };
}
