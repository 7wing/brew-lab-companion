import { Trophy, Clock, Users, ChevronRight } from "lucide-react";

const challenges = [
  {
    id: 1,
    title: "30-Day Kombucha Challenge",
    description: "Brew 4 unique kombucha flavors in 30 days. Document each F2 with photos and tasting notes.",
    participants: 128,
    daysLeft: 18,
    progress: 40,
    type: "kombucha",
    active: true,
  },
  {
    id: 2,
    title: "Spring Mead Showdown",
    description: "Create a spring-inspired mead using seasonal ingredients. Community vote for best recipe.",
    participants: 67,
    daysLeft: 45,
    progress: 20,
    type: "mead",
    active: true,
  },
  {
    id: 3,
    title: "Sourdough Starter Sprint",
    description: "Start a new sourdough culture from scratch. First to achieve consistent doubling wins.",
    participants: 203,
    daysLeft: 5,
    progress: 85,
    type: "sourdough",
    active: true,
  },
  {
    id: 4,
    title: "Holiday Spiced Cider",
    description: "Craft a spiced cider using at least 3 seasonal spices. Submit by Dec 20.",
    participants: 89,
    daysLeft: 0,
    progress: 100,
    type: "cider",
    active: false,
  },
];

const typeColor: Record<string, string> = {
  kombucha: "from-teal/20 to-teal/5 border-teal/20",
  mead: "from-gold/20 to-gold/5 border-gold/20",
  sourdough: "from-copper/15 to-gold/10 border-gold/15",
  cider: "from-copper/20 to-copper/5 border-copper/20",
};

const progressColor: Record<string, string> = {
  kombucha: "bg-teal",
  mead: "bg-gold",
  sourdough: "bg-copper",
  cider: "bg-copper",
};

const Challenges = () => {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-slab text-2xl md:text-3xl font-bold">Challenges</h1>
        <p className="text-muted-foreground text-sm mt-1">Push your fermentation skills</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges.map((c) => (
          <div
            key={c.id}
            className={`glass-panel rounded-xl p-5 border bg-gradient-to-br ${typeColor[c.type]} hover:shadow-xl transition-all duration-300 cursor-pointer group`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy size={18} className={c.active ? "text-gold" : "text-muted-foreground"} />
                {!c.active && (
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Completed</span>
                )}
              </div>
              <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>

            <h3 className="font-slab font-semibold text-lg mb-2">{c.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{c.description}</p>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-muted/50 overflow-hidden mb-3">
              <div
                className={`h-full rounded-full ${progressColor[c.type]} transition-all duration-1000`}
                style={{ width: `${c.progress}%` }}
              />
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users size={12} /> {c.participants}
              </span>
              {c.daysLeft > 0 ? (
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {c.daysLeft}d left
                </span>
              ) : (
                <span className="text-muted-foreground">Ended</span>
              )}
              <span className="ml-auto font-medium">{c.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Challenges;
