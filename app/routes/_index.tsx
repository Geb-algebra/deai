import { MoonIcon, SunIcon } from "lucide-react";
import { Link } from "react-router";
import { Switch } from "~/components/atoms/switch";
import { useTheme } from "~/context";

export async function loader() {
	console.log("hello from loader");
	return null;
}

export function meta() {
	return [
		{ title: "New React Router App" },
		{ name: "description", content: "Welcome to React Router!" },
	];
}

export default function Home() {
	const { theme, setTheme } = useTheme();
	return (
		<>
			<div className="flex items-center space-x-2">
				<SunIcon size={16} />
				<Switch
					id="airplane-mode"
					checked={theme === "dark"}
					onCheckedChange={(checked) => {
						setTheme(checked ? "dark" : "light");
					}}
				/>
				<MoonIcon size={16} />
			</div>
			<Link to="prerendered" className="font-bold text-destructive">
				Go to prerendered page
			</Link>
		</>
	);
}
