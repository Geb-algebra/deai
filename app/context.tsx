import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
	theme: Theme;
	setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [theme, setTheme] = useState<Theme>("light");

	useEffect(() => {
		const storedTheme = localStorage.getItem("theme");
		if (storedTheme) {
			setTheme(storedTheme as Theme);
		}
	}, []);

	useEffect(() => {
		localStorage.setItem("theme", theme);
	}, [theme]);

	return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
};
