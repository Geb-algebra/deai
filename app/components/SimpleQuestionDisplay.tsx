import type { FC } from "react";
import type { ProgressUpdate } from "../workers/types";

interface SimpleQuestionDisplayProps {
	modelLoading: boolean;
	progress: ProgressUpdate | null;
	elapsedTime: number;
	question: string;
	isGenerating: boolean;
	error: string | null;
}

const SimpleQuestionDisplay: FC<SimpleQuestionDisplayProps> = ({
	modelLoading,
	progress,
	elapsedTime,
	question,
	isGenerating,
	error,
}) => {
	if (error) {
		return <p>Error: {error}</p>;
	}

	if (modelLoading) {
		return (
			<div>
				<h3>Loading Model...</h3>
				{progress && (
					<div>
						<p>{progress.text}</p>
						<progress value={progress.progress} max="1" />
						<p>
							<span>{(progress.progress * 100).toFixed(2)}%</span>
							{progress.loadedMB !== undefined && progress.totalMB !== undefined && (
								<span style={{ marginLeft: "1em" }}>
									{progress.loadedMB.toFixed(2)} / {progress.totalMB.toFixed(2)} MB
								</span>
							)}
							<span style={{ marginLeft: "1em" }}>Elapsed: {elapsedTime.toFixed(1)}s</span>
						</p>
					</div>
				)}
			</div>
		);
	}

	return (
		<div>
			<h3>Generated Question:</h3>
			{isGenerating && <p>Generating new question...</p>}
			{question && <p>{question}</p>}
		</div>
	);
};

export default SimpleQuestionDisplay;
