import Quill from "quill";
import "quill/dist/quill.bubble.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "~/utils/css";
import "./QuillEditor.css";
import styles from "./QuillEditor.module.css";

interface QuillEditorProps {
	content?: string;
	placeholder?: string;
	onContentChange?: (content: string) => void;
	onIdle?: (content: string) => void;
	idleTimeout?: number;
	className?: string;
}

export function QuillEditor({
	content,
	placeholder = "Start writing your thoughts...",
	onContentChange,
	onIdle,
	idleTimeout = 5000,
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

		const content = quillRef.current.root.innerHTML;
		const plainText = quillRef.current.getText().trim();

		// Call content change callback
		if (onContentChange) {
			onContentChange(content);
		}

		// Clear existing idle timer
		if (idleTimerRef.current) {
			clearTimeout(idleTimerRef.current);
		}

		// Set new idle timer if there's content
		if (plainText && onIdle) {
			idleTimerRef.current = setTimeout(() => {
				onIdle(content);
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
			quillRef.current?.setContents(content);
		}
	}, [content]);

	return (
		<div
			className={cn(
				styles.quillEditorContainer,
				"bg-card h-full w-full rounded-3xl border border-border overflow-y-hidden",
				className,
			)}
		>
			<div ref={editorRef} className={cn(styles.quillEditor, "h-full w-full overflow-y-hidden")} />
		</div>
	);
}
