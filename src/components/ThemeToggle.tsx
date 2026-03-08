import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hh-theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("hh-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="relative w-14 h-7 rounded-full bg-muted border border-border transition-colors duration-300 flex items-center px-0.5"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div
        className={`w-6 h-6 rounded-full bg-gradient-to-br from-copper to-gold shadow-md flex items-center justify-center transition-transform duration-300 ${
          dark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {dark ? <Moon size={12} className="text-copper-foreground" /> : <Sun size={12} className="text-copper-foreground" />}
      </div>
    </button>
  );
};

export default ThemeToggle;
