import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      onClick={() =>
        setTheme(isLight ? "dark" : "light")
      }
      className="relative w-16 h-8 rounded-full transition-all duration-500 focus:outline-none"
      style={{
        background: isLight
          ? "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(230,230,230,0.65))"
          : "linear-gradient(135deg, rgba(60,60,70,0.9), rgba(30,30,40,0.95))",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: isLight
          ? "inset 0 0 6px rgba(0,0,0,0.18), 0 4px 10px rgba(0,0,0,0.25)"
          : "inset 0 0 6px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.6)",
      }}
    >
      {/* Toggle Ball */}
      <span
        className="absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500"
        style={{
          transform: isLight ? "translateX(32px)" : "translateX(0)",
          background: isLight
            ? "linear-gradient(135deg, #ffffff, #f3f4f6)"
            : "linear-gradient(135deg, #9ca3af, #374151)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
        }}
      >
        {isLight ? (
          /* ☀ SUN – outlined */
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="white"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="2" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
            <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
            <line x1="2" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="22" y2="12" />
            <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
            <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          /* 🌙 MOON – untouched */
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        )}
      </span>
    </button>
  );
}
