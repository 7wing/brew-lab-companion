import { useState } from "react";
import { Video, MessageSquare, Send, Smile, ThumbsUp, Heart, Star, Users, Minimize2, Maximize2 } from "lucide-react";

interface ChatMessage {
  id: number;
  author: string;
  text: string;
  time: string;
}

const initialMessages: ChatMessage[] = [
  { id: 1, author: "BrewerMike", text: "The color on this amber is gorgeous 🍺", time: "2m ago" },
  { id: 2, author: "KombuchaKate", text: "Getting a nice caramel nose — what crystal malt did you use?", time: "1m ago" },
  { id: 3, author: "MeadMaven", text: "Looks like great clarity for day 14!", time: "45s ago" },
];

const reactions = [
  { emoji: "🍺", label: "Cheers" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "👏", label: "Clap" },
  { emoji: "🤤", label: "Tasty" },
];

const participants = [
  { name: "BrewerMike", color: "from-copper/30 to-copper/10" },
  { name: "KombuchaKate", color: "from-teal/30 to-teal/10" },
  { name: "MeadMaven", color: "from-gold/30 to-gold/10" },
  { name: "FermentNovice", color: "from-copper/20 to-teal/20" },
  { name: "You", color: "from-copper/40 to-teal/30" },
];

interface FloatingReaction {
  id: number;
  emoji: string;
  x: number;
}

const LiveTasting = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [miniMode, setMiniMode] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [tastingNote, setTastingNote] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), author: "You", text: input, time: "now" },
    ]);
    setInput("");
  };

  const sendReaction = (emoji: string) => {
    const id = Date.now();
    const x = 20 + Math.random() * 60;
    setFloatingReactions((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 3000);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-slab text-2xl md:text-3xl font-bold">Live Tasting</h1>
          <p className="text-muted-foreground text-sm mt-1">Autumn Amber Ale — Group Tasting Session</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users size={16} />
          <span>{participants.length} live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Main video area */}
        <div className="space-y-4">
          <div className={`relative glass-panel rounded-xl overflow-hidden ${miniMode ? "h-48" : "aspect-video"} transition-all duration-300`}>
            {/* Simulated video area */}
            <div className="absolute inset-0 bg-gradient-to-br from-card to-muted flex items-center justify-center">
              <div className="text-center">
                <Video size={48} className="text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-sm text-muted-foreground">Live fermentation cam / group tasting stream</p>
                <p className="text-xs text-muted-foreground mt-1">Camera feed would appear here</p>
              </div>
            </div>

            {/* Floating reactions */}
            {floatingReactions.map((r) => (
              <div
                key={r.id}
                className="absolute bottom-0 text-2xl animate-bubble-rise pointer-events-none"
                style={{ left: `${r.x}%` }}
              >
                {r.emoji}
              </div>
            ))}

            {/* HUD overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-full bg-destructive/80 text-destructive-foreground text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive-foreground animate-pulse" />
                Live
              </div>
              <span className="px-2 py-1 rounded-full bg-background/60 backdrop-blur-sm text-[10px] font-medium">
                14:32
              </span>
            </div>

            {/* Participant bubbles overlay */}
            <div className="absolute top-3 right-3 flex -space-x-2">
              {participants.slice(0, 4).map((p, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br ${p.color} flex items-center justify-center`}
                  title={p.name}
                >
                  <span className="text-[10px] font-bold">{p.name[0]}</span>
                </div>
              ))}
              {participants.length > 4 && (
                <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                  <span className="text-[10px] font-bold">+{participants.length - 4}</span>
                </div>
              )}
            </div>

            {/* Mini/Full toggle */}
            <button
              onClick={() => setMiniMode(!miniMode)}
              className="absolute bottom-3 right-3 p-2 rounded-lg bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-colors"
            >
              {miniMode ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>
          </div>

          {/* Reaction bar */}
          <div className="flex items-center gap-2">
            {reactions.map((r, i) => (
              <button
                key={i}
                onClick={() => sendReaction(r.emoji)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-panel hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-95"
                title={r.label}
              >
                <span className="text-lg">{r.emoji}</span>
                <span className="text-xs text-muted-foreground hidden sm:inline">{r.label}</span>
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                <ThumbsUp size={18} />
              </button>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                <Heart size={18} />
              </button>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                <Star size={18} />
              </button>
            </div>
          </div>

          {/* Tasting notes input */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="font-slab font-semibold text-sm mb-3 flex items-center gap-2">
              <Smile size={16} className="text-gold" />
              Your Tasting Notes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              {[
                { label: "Aroma", placeholder: "Caramel, citrus..." },
                { label: "Flavor", placeholder: "Balanced malt, hop bitterness..." },
                { label: "Mouthfeel", placeholder: "Medium body, smooth..." },
              ].map((field, i) => (
                <div key={i}>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    className="w-full h-9 px-3 rounded-lg bg-muted/50 border border-border/50 text-xs focus:outline-none focus:ring-2 focus:ring-gold/30 placeholder:text-muted-foreground"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tastingNote}
                onChange={(e) => setTastingNote(e.target.value)}
                placeholder="Overall impression..."
                className="flex-1 h-9 px-3 rounded-lg bg-muted/50 border border-border/50 text-xs focus:outline-none focus:ring-2 focus:ring-gold/30 placeholder:text-muted-foreground"
              />
              <button className="px-4 h-9 rounded-lg bg-gold text-gold-foreground text-xs font-medium hover:opacity-90 transition-opacity">
                Save Note
              </button>
            </div>
          </div>
        </div>

        {/* Chat sidebar */}
        <div className="glass-panel rounded-xl flex flex-col h-[500px] lg:h-auto">
          <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
            <MessageSquare size={16} className="text-teal" />
            <h3 className="font-slab font-semibold text-sm">Live Chat</h3>
            <span className="ml-auto text-[10px] text-muted-foreground">{messages.length} messages</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="animate-fade-in">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold">{msg.author}</span>
                  <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pl-0">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Say something..."
                className="flex-1 h-9 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 placeholder:text-muted-foreground"
              />
              <button
                onClick={sendMessage}
                className="w-9 h-9 rounded-lg bg-teal text-teal-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTasting;
