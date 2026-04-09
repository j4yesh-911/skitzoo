import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // ✅ safe localStorage read
    return localStorage.getItem("theme") || "dark";
  });

  const dark = theme === "dark";

  useEffect(() => {
    const root = document.documentElement;

    // ✅ Tailwind dark mode control
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // ✅ persist theme
    localStorage.setItem("theme", theme);
  }, [theme, dark]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, dark }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ✅ safe hook
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
