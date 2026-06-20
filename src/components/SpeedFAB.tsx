import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  FlaskConical,
  Thermometer,
  Beer,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";

interface SpeedFABProps {
  show?: boolean;
}

const SpeedFAB = ({ show = true }: SpeedFABProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [abvOpen, setAbvOpen] = useState(false);
  const [tempOpen, setTempOpen] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleNewBrew = () => {
    setIsOpen(false);
    navigate("/new-brew");
  };

  if (!show) return null;

  return (
    <div
      ref={fabRef}
      className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 z-50 flex flex-col items-end gap-2"
    >
      {/* Expanded Menu Options */}
      <div
        className={`flex flex-col gap-2 mb-2 transition-all duration-300 ease-out ${
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {/* ABV Calculator */}
        <Sheet open={abvOpen} onOpenChange={setAbvOpen}>
          <SheetTrigger asChild>
            <button
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg hover:bg-muted transition-all whitespace-nowrap"
              onClick={() => {
                setIsOpen(false);
                setAbvOpen(true);
              }}
            >
              <span className="p-1.5 rounded-lg bg-copper/10">
                <FlaskConical size={16} className="text-copper" />
              </span>
              <span className="text-sm font-medium">ABV Calculator</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl pb-8">
            <SheetHeader>
              <SheetTitle className="font-slab flex items-center gap-2">
                <FlaskConical size={18} className="text-copper" />
                ABV Calculator
              </SheetTitle>
            </SheetHeader>
            <AbvCalculatorContent />
          </SheetContent>
        </Sheet>

        {/* Temp Converter */}
        <Sheet open={tempOpen} onOpenChange={setTempOpen}>
          <SheetTrigger asChild>
            <button
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg hover:bg-muted transition-all whitespace-nowrap"
              onClick={() => {
                setIsOpen(false);
                setTempOpen(true);
              }}
            >
              <span className="p-1.5 rounded-lg bg-teal/10">
                <Thermometer size={16} className="text-teal" />
              </span>
              <span className="text-sm font-medium">Temp Converter</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl pb-8">
            <SheetHeader>
              <SheetTitle className="font-slab flex items-center gap-2">
                <Thermometer size={18} className="text-teal" />
                Temperature Converter
              </SheetTitle>
            </SheetHeader>
            <TempConverterContent />
          </SheetContent>
        </Sheet>

        {/* New Brew */}
        <button
          onClick={handleNewBrew}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-copper to-amber-600 text-copper-foreground shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
        >
          <span className="p-1.5 rounded-lg bg-copper-foreground/20">
            <Beer size={16} className="text-copper-foreground" />
          </span>
          <span className="text-sm font-medium">New Brew</span>
        </button>
      </div>

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-copper to-amber-700 text-copper-foreground shadow-xl hover:shadow-2xl transition-all flex items-center justify-center hover:scale-105 active:scale-95"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <Plus
          size={24}
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-45" : "rotate-0"
          }`}
        />
      </button>
    </div>
  );
};

// Inline content components for cleaner code
function AbvCalculatorContent() {
  const [og, setOg] = useState("");
  const [fg, setFg] = useState("");
  const abv =
    og && fg
      ? ((parseFloat(og) - parseFloat(fg)) * 131.25).toFixed(1)
      : null;

  return (
    <div className="mt-6 space-y-4">
      <div>
        <Label htmlFor="fab-og-inline">Original Gravity (OG)</Label>
        <input
          id="fab-og-inline"
          type="number"
          step="0.001"
          min="1"
          max="1.2"
          placeholder="1.050"
          value={og}
          onChange={(e) => setOg(e.target.value)}
          className="mt-1.5 w-full h-11 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-copper/30"
        />
      </div>
      <div>
        <Label htmlFor="fab-fg-inline">Final Gravity (FG)</Label>
        <input
          id="fab-fg-inline"
          type="number"
          step="0.001"
          min="0.99"
          max="1.2"
          placeholder="1.010"
          value={fg}
          onChange={(e) => setFg(e.target.value)}
          className="mt-1.5 w-full h-11 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-copper/30"
        />
      </div>
      <div className="glass-panel rounded-xl p-4 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          Estimated ABV
        </p>
        <p className="text-4xl font-mono font-bold text-copper">
          {abv ? `${abv}%` : "—"}
        </p>
      </div>
      <p className="text-[10px] text-muted-foreground text-center">
        Formula: (OG − FG) × 131.25
      </p>
    </div>
  );
}

function TempConverterContent() {
  const [fahrenheit, setFahrenheit] = useState("");
  const [celsius, setCelsius] = useState("");

  function updateFromF(val: string) {
    setFahrenheit(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setCelsius(((num - 32) * 5 / 9).toFixed(1));
    } else {
      setCelsius("");
    }
  }

  function updateFromC(val: string) {
    setCelsius(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setFahrenheit((num * 9 / 5 + 32).toFixed(1));
    } else {
      setFahrenheit("");
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <div>
        <Label htmlFor="fab-f-inline">Fahrenheit (°F)</Label>
        <input
          id="fab-f-inline"
          type="number"
          step="0.1"
          placeholder="68"
          value={fahrenheit}
          onChange={(e) => updateFromF(e.target.value)}
          className="mt-1.5 w-full h-11 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
        />
      </div>
      <div className="flex justify-center">
        <span className="text-sm text-muted-foreground">⇅</span>
      </div>
      <div>
        <Label htmlFor="fab-c-inline">Celsius (°C)</Label>
        <input
          id="fab-c-inline"
          type="number"
          step="0.1"
          placeholder="20"
          value={celsius}
          onChange={(e) => updateFromC(e.target.value)}
          className="mt-1.5 w-full h-11 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
        />
      </div>
    </div>
  );
}

export default SpeedFAB;
