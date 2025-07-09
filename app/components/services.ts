import type Quill from "quill";
import TurndownService from "turndown";

function getTurndownService() {
	const turndownService = new TurndownService({
		headingStyle: "atx",
		bulletListMarker: "*",
	});

	const listCounters: Record<number, number> = {};

	turndownService.addRule("quill-ordered-list", {
		filter: (node): node is HTMLLIElement => {
			return node.nodeName === "LI" && node.getAttribute("data-list") === "ordered";
		},
		replacement(content, node) {
			const li = node as HTMLLIElement;
			const indentMatch = li.className.match(/ql-indent-(\d+)/);
			const indentLevel = indentMatch ? Number.parseInt(indentMatch[1], 10) : 0;

			const prev = li.previousElementSibling;
			const isNewList =
				!prev ||
				prev.getAttribute("data-list") !== "ordered" ||
				!prev.className.includes(`ql-indent-${indentLevel}`);

			if (isNewList) {
				listCounters[indentLevel] = 1;
			} else {
				listCounters[indentLevel] = (listCounters[indentLevel] || 0) + 1;
			}

			// biome-ignore lint/complexity/noForEach: This is a simple loop
			Object.keys(listCounters).forEach((levelStr) => {
				const level = Number.parseInt(levelStr, 10);
				if (level > indentLevel) {
					delete listCounters[level];
				}
			});

			const indent = "  ".repeat(indentLevel);
			const number = listCounters[indentLevel];
			return `${indent}${number}. ${content}\n`;
		},
	});

	turndownService.addRule("quill-bullet-list", {
		filter(node) {
			return node.nodeName === "LI" && node.getAttribute("data-list") === "bullet";
		},
		replacement(content, node) {
			const li = node as HTMLLIElement;
			const indentMatch = li.className.match(/ql-indent-(\d+)/);
			const indentLevel = indentMatch ? Number.parseInt(indentMatch[1], 10) : 0;
			const indent = "  ".repeat(indentLevel);
			return `${indent}* ${content}\n`;
		},
	});

	return turndownService;
}

export function convertQuillToMarkdown(quill: Quill): string {
	const turndownService = getTurndownService();
	const html = quill.root.innerHTML;
	return turndownService.turndown(html);
}

export function copyQuillContentAsMarkdown(quill: Quill | null): void {
	if (!quill) return;
	const markdown = convertQuillToMarkdown(quill);
	navigator.clipboard.writeText(markdown);
}
