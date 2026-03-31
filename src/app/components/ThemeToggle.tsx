import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-card/10 transition-colors"
            aria-label="Toggle theme"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
            {theme === "light" ? (
                <Moon className="h-5 w-5 text-muted-foreground dark:text-muted-foreground" />
            ) : (
                <Sun className="h-5 w-5 text-muted-foreground dark:text-muted-foreground" />
            )}
        </button>
    );
}
