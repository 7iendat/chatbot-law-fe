// src/contexts/ThemeContext.tsx
"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";

export type Theme = "light" | "dark" | "system"; // Thêm 'system' để theo cài đặt hệ thống

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    effectiveTheme: "light" | "dark"; // Theme thực tế đang được áp dụng
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window !== "undefined") {
            const storedTheme = localStorage.getItem("theme") as Theme | null;
            if (storedTheme) {
                return storedTheme;
            }
            // Nếu không có theme nào được lưu, kiểm tra cài đặt hệ thống
            if (
                window.matchMedia &&
                window.matchMedia("(prefers-color-scheme: dark)").matches
            ) {
                return "dark"; // Mặc định là dark nếu hệ thống là dark
            }
        }
        return "light"; // Mặc định là light
    });

    const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">(
        theme === "dark" ? "dark" : "light"
    );

    useEffect(() => {
        let currentEffectiveTheme: "light" | "dark";

        if (theme === "system") {
            currentEffectiveTheme = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches
                ? "dark"
                : "light";
        } else {
            currentEffectiveTheme = theme;
        }
        setEffectiveTheme(currentEffectiveTheme);

        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(currentEffectiveTheme);

        if (typeof window !== "undefined") {
            localStorage.setItem("theme", theme); // Lưu lựa chọn theme (light, dark, hoặc system)
        }
    }, [theme]);

    // Lắng nghe thay đổi theme hệ thống nếu theme hiện tại là 'system'
    useEffect(() => {
        if (theme !== "system") return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            setEffectiveTheme(mediaQuery.matches ? "dark" : "light");
            // Không cần set lại class ở root ở đây vì useEffect trên đã làm
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
