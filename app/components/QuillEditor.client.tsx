import { ClipboardCopy } from "lucide-react";
import Quill, { Delta } from "quill";
import "quill/dist/quill.bubble.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { convertQuillToMarkdown, copyQuillContentAsMarkdown } from "~/components/services";
import { cn } from "~/lib/utils";
import "./QuillEditor.css";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

type RecoverableContent = string;

interface QuillContentInfo {
	content: RecoverableContent;
	plainText: string;
	markdownContent: string;
	focusedContent?: string;
	currentParagraph?: string;
	currentSection?: string;
}

interface QuillEditorProps {
	content?: RecoverableContent;
	placeholder?: string;
	onContentChange?: (content: QuillContentInfo) => void;
	onIdle?: (content: QuillContentInfo) => void;
	idleTimeout?: number;
	className?: string;
}

export function QuillEditor({
	content,
	placeholder = "Start writing your thoughts...",
	onContentChange,
	onIdle,
	idleTimeout = 3000,
	className = "",
}: QuillEditorProps) {
	const editorRef = useRef<HTMLDivElement>(null);
	const quillRef = useRef<Quill | null>(null);
	const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
	const [isReady, setIsReady] = useState(false);

	const handleCopyAsMarkdown = useCallback(() => {
		copyQuillContentAsMarkdown(quillRef.current);
	}, []);

	// Extract current line + 2 lines before and after (5-line window, markdown formatted)
	const extractCurrentLine = useCallback((quill: Quill) => {
		const selection = quill.getSelection();
		const markdown = convertQuillToMarkdown(quill);
		const markdownLines = markdown.split("\n");

		if (!selection) {
			// No selection, fall back to last 5 lines (or available lines)
			const startIndex = Math.max(0, markdownLines.length - 5);
			return markdownLines.slice(startIndex).join("\n");
		}

		const plainText = quill.getText();
		const cursorIndex = selection.index;

		// Find which line the cursor is on in plain text
		const textBeforeCursor = plainText.slice(0, cursorIndex);
		const lineNumber = textBeforeCursor.split("\n").length - 1; // 0-indexed

		// Extract 5-line window: current line ± 2 lines
		const startLine = Math.max(0, lineNumber - 2);
		const endLine = Math.min(markdownLines.length - 1, lineNumber + 2);

		// Return the 5-line window in markdown format
		return markdownLines.slice(startLine, endLine + 1).join("\n");
	}, []);

	// Extract content between nearest headers (markdown formatted section)
	const extractCurrentSection = useCallback((quill: Quill) => {
		const selection = quill.getSelection();
		const markdown = convertQuillToMarkdown(quill);
		const markdownLines = markdown.split("\n");

		let currentLineNumber = 0;
		if (selection) {
			const plainText = quill.getText();
			const cursorIndex = selection.index;
			const textBeforeCursor = plainText.slice(0, cursorIndex);
			currentLineNumber = textBeforeCursor.split("\n").length - 1;
		} else {
			// No selection, use last line
			currentLineNumber = markdownLines.length - 1;
		}

		// Find the nearest header before the cursor
		let sectionStart = 0;
		for (let i = currentLineNumber; i >= 0; i--) {
			if (markdownLines[i]?.startsWith("#")) {
				sectionStart = i;
				break;
			}
		}

		// Find the nearest header after the cursor (or end of document)
		let sectionEnd = markdownLines.length - 1;
		for (let i = currentLineNumber + 1; i < markdownLines.length; i++) {
			if (markdownLines[i]?.startsWith("#")) {
				sectionEnd = i - 1;
				break;
			}
		}

		// Extract the section content (including the header)
		return markdownLines.slice(sectionStart, sectionEnd + 1).join("\n");
	}, []);

	// Extract current paragraph where cursor is located (markdown formatted)
	const extractCurrentParagraph = useCallback((quill: Quill) => {
		const selection = quill.getSelection();
		if (!selection) {
			const markdown = convertQuillToMarkdown(quill);
			const paragraphs = markdown.split(/\n\s*\n/);
			return paragraphs[paragraphs.length - 1] || "";
		}

		const plainText = quill.getText();
		const cursorIndex = selection.index;

		// Find paragraph boundaries in plain text
		const beforeCursor = plainText.slice(0, cursorIndex);
		const afterCursor = plainText.slice(cursorIndex);

		const paragraphStart = Math.max(
			beforeCursor.lastIndexOf("\n\n"),
			beforeCursor.lastIndexOf("\n \n"),
			0,
		);

		const paragraphEnd = afterCursor.search(/\n\s*\n/);
		const actualEnd = paragraphEnd === -1 ? plainText.length : cursorIndex + paragraphEnd;

		const paragraphText = plainText.slice(paragraphStart, actualEnd).trim();

		// Convert to markdown and find corresponding paragraph
		const markdown = convertQuillToMarkdown(quill);
		const markdownParagraphs = markdown.split(/\n\s*\n/);

		// Find the markdown paragraph that contains similar content
		for (const markdownParagraph of markdownParagraphs) {
			const plainMarkdownParagraph = markdownParagraph.replace(/[*_#`\[\]()]/g, "").trim();
			const plainCurrentParagraph = paragraphText.trim();

			if (
				plainMarkdownParagraph === plainCurrentParagraph ||
				(plainCurrentParagraph && plainMarkdownParagraph.includes(plainCurrentParagraph))
			) {
				return markdownParagraph;
			}
		}

		// Fallback: return plain text paragraph if markdown matching fails
		return paragraphText;
	}, []);

	// Initialize Quill editor
	useEffect(() => {
		if (!editorRef.current || quillRef.current) return;

		const quill = new Quill(editorRef.current, {
			theme: "bubble",
			placeholder,
			modules: {
				clipboard: {
					matchVisual: false,
				},
			},
			formats: ["header", "bold", "italic", "underline", "list", "bullet", "indent"],
		});

		quillRef.current = quill;
		setIsReady(true);

		// Cleanup function
		return () => {
			if (quillRef.current) {
				quillRef.current = null;
			}
		};
	}, [placeholder]);

	// Handle content changes and idle detection
	const handleTextChange = useCallback(() => {
		if (!quillRef.current) return;

		const content = JSON.stringify(quillRef.current.getContents());
		const plainText = quillRef.current.getText().trim();
		const markdownContent = convertQuillToMarkdown(quillRef.current);

		// Extract current line, paragraph, and section based on cursor position
		const focusedContent = extractCurrentLine(quillRef.current);
		const currentParagraph = extractCurrentParagraph(quillRef.current);
		const currentSection = extractCurrentSection(quillRef.current);

		// Call content change callback
		if (onContentChange) {
			onContentChange({
				content,
				plainText,
				markdownContent,
				focusedContent,
				currentParagraph,
				currentSection,
			});
		}

		// Clear existing idle timer
		if (idleTimerRef.current) {
			clearTimeout(idleTimerRef.current);
		}

		// Set new idle timer if there's content
		if (plainText && onIdle) {
			idleTimerRef.current = setTimeout(() => {
				// Re-extract focused content at idle time to get current cursor position
				if (quillRef.current) {
					const idleMarkdownContent = convertQuillToMarkdown(quillRef.current);
					const idleFocusedContent = extractCurrentLine(quillRef.current);
					const idleCurrentParagraph = extractCurrentParagraph(quillRef.current);
					const idleCurrentSection = extractCurrentSection(quillRef.current);
					onIdle({
						content,
						plainText,
						markdownContent: idleMarkdownContent,
						focusedContent: idleFocusedContent,
						currentParagraph: idleCurrentParagraph,
						currentSection: idleCurrentSection,
					});
				}
			}, idleTimeout);
		}
	}, [
		onContentChange,
		onIdle,
		idleTimeout,
		extractCurrentLine,
		extractCurrentParagraph,
		extractCurrentSection,
	]);

	// Set up text change listener
	useEffect(() => {
		if (!quillRef.current || !isReady) return;

		quillRef.current.on("text-change", handleTextChange);

		return () => {
			if (quillRef.current) {
				quillRef.current.off("text-change", handleTextChange);
			}
		};
	}, [handleTextChange, isReady]);

	// Cleanup timer on unmount
	useEffect(() => {
		return () => {
			if (idleTimerRef.current) {
				clearTimeout(idleTimerRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (content) {
			const newContent = new Delta(JSON.parse(content));
			const currentContent = quillRef.current?.getContents();
			if (currentContent) {
				const diff = currentContent.diff(newContent);
				quillRef.current?.updateContents(diff);
			} else {
				quillRef.current?.setContents(newContent);
			}
		}
	}, [content]);

	return (
		<div
			className={cn(
				"bg-card h-full w-full rounded-2xl border border-border overflow-y-hidden relative",
				className,
			)}
		>
			<div ref={editorRef} className={cn("h-full w-full overflow-y-hidden")} />
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="absolute top-2 right-2"
							onClick={handleCopyAsMarkdown}
						>
							<ClipboardCopy className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Copy as Markdown</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
}
