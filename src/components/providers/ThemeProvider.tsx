import { createContext, useContext, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
    theme: Theme;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "theme";

const listeners = new Set<() => void>();

const getSnapshot = (): Theme => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    return savedTheme === "light" ? "light" : "dark";
};

const getServerSnapshot = (): Theme => "dark";

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

const applyTheme = (theme: Theme) => {
    document.documentElement.classList.toggle("dark", theme === "dark");
};

const setTheme = (theme: Theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
    listeners.forEach((listener) => listener());
};

export const ThemeProvider = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
