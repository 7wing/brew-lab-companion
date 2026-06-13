import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const dark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="relative w-14 h-7 rounded-full bg-muted border border-border transition-colors duration-300 flex items-center px-0.5"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-copper to-gold shadow-md flex items-center justify-center transition-transform duration-300 ${dark ? "translate-x-7" : "translate-x-0"}`}>
        {dark
          ? <Moon size={12} className="text-copper-foreground" />
          : <Sun size={12} className="text-copper-foreground" />
        }
      </div>
    </button>
  )
}

export default ThemeToggle
