import Quill, { Delta } from "quill";
import "quill/dist/quill.bubble.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "~/utils/css";
import "./QuillEditor.css";

type RecoverableContent = string;

interface QuillContentInfo {
	content: RecoverableContent;
	plainText: string;
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
			formats: ["header", "bold", "italic", "underline", "list", "bullet"],
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

		// Call content change callback
		if (onContentChange) {
			onContentChange({ content, plainText });
		}

		// Clear existing idle timer
		if (idleTimerRef.current) {
			clearTimeout(idleTimerRef.current);
		}

		// Set new idle timer if there's content
		if (plainText && onIdle) {
			idleTimerRef.current = setTimeout(() => {
				onIdle({ content, plainText });
			}, idleTimeout);
		}
	}, [onContentChange, onIdle, idleTimeout]);

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
				"bg-card h-full w-full rounded-2xl border border-border overflow-y-hidden",
				className,
			)}
		>
			<div ref={editorRef} className={cn("h-full w-full overflow-y-hidden")} />
		</div>
	);
}
