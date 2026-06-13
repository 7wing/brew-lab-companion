import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  useLatestTastingSession,
  useCreateTastingSession,
  useCreateTastingNote,
} from "@/hooks/useTastingNotes";
import {
  useTastingMessages,
  useSendTastingMessage,
} from "@/hooks/useTastingMessages";
import {
  Video,
  MessageSquare,
  Send,
  Smile,
  ThumbsUp,
  Heart,
  Star,
  Users,
  Minimize2,
  Maximize2,
  Loader2,
  Plus,
} from "lucide-react";

const reactions = [
  { emoji: "🍺", label: "Cheers" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "👏", label: "Clap" },
  { emoji: "🤤", label: "Tasty" },
];

interface FloatingReaction {
  id: number;
  emoji: string;
  x: number;
}

const LiveTastingPanel = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [miniMode, setMiniMode] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [input, setInput] = useState("");
  const [tastingNote, setTastingNote] = useState({
    aroma: "",
    flavor: "",
    mouthfeel: "",
    overall: "",
  });

  /* ── Session ── */
  const {
    data: session,
    isLoading: sessionLoading,
  } = useLatestTastingSession();
  const sessionId = session?.id;
  const createSession = useCreateTastingSession();

  /* ── Messages ── */
  const { data: messages, isLoading: messagesLoading } =
    useTastingMessages(sessionId);
  const sendMessage = useSendTastingMessage(sessionId);

  /* ── Realtime ── */
  useEffect(() => {
    if (!sessionId) return;
    const channel = supabase
      .channel(`tasting-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tasting_messages",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["tasting-messages", sessionId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, qc]);

  /* ── Tasting Note ── */
  const saveTastingNote = useCreateTastingNote();

  function handleSend() {
    if (!input.trim()) return;
    sendMessage.mutate(input.trim());
    setInput("");
  }

  function sendReaction(emoji: string) {
    const id = Date.now();
    const x = 20 + Math.random() * 60;
    setFloatingReactions((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 3000);
  }

  if (sessionLoading || messagesLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-muted/50 rounded animate-pulse" />
        <div className="h-64 bg-muted/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!session) {
    return (
      <div>
        <h1 className="font-slab text-2xl md:text-3xl font-bold mb-2">Live Tasting</h1>
        <p className="text-muted-foreground text-sm mt-1 mb-6">
          No active tasting session.
        </p>
        <button
          onClick={() => createSession.mutate("Live Tasting")}
          disabled={createSession.isPending}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-copper to-copper/80 text-copper-foreground font-medium text-sm shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50"
        >
          {createSession.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Start Session
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-slab text-2xl md:text-3xl font-bold">Live Tasting</h1>
          <p className="text-muted-foreground text-sm mt-1">{session.title}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users size={16} />
          <span>{(messages ?? []).length} msgs</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Main area */}
        <div className="space-y-4">
          <div className={`relative glass-panel rounded-xl overflow-hidden ${miniMode ? "h-48" : "aspect-video"} transition-all duration-300`}>
            <div className="absolute inset-0 bg-gradient-to-br from-card to-muted flex items-center justify-center">
              <div className="text-center">
                <Video size={48} className="text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-sm text-muted-foreground">Live fermentation cam / group tasting stream</p>
                <p className="text-xs text-muted-foreground mt-1">Camera feed would appear here</p>
              </div>
            </div>

            {floatingReactions.map((r) => (
              <div
                key={r.id}
                className="absolute bottom-0 text-2xl animate-bubble-rise pointer-events-none"
                style={{ left: `${r.x}%` }}
              >
                {r.emoji}
              </div>
            ))}

            <div className="absolute top-3 left-3 flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-full bg-destructive/80 text-destructive-foreground text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive-foreground animate-pulse" />
                Live
              </div>
              <span className="px-2 py-1 rounded-full bg-background/60 backdrop-blur-sm text-[10px] font-medium">
                {session.is_live ? "Streaming" : "Offline"}
              </span>
            </div>

            <button
              onClick={() => setMiniMode(!miniMode)}
              className="absolute bottom-3 right-3 p-2 rounded-lg bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-colors"
            >
              {miniMode ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>
          </div>

          {/* Reactions */}
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
                { key: "aroma", label: "Aroma", placeholder: "Caramel, citrus..." },
                { key: "flavor", label: "Flavor", placeholder: "Balanced malt, hop bitterness..." },
                { key: "mouthfeel", label: "Mouthfeel", placeholder: "Medium body, smooth..." },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={(tastingNote as any)[field.key]}
                    onChange={(e) =>
                      setTastingNote((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    className="w-full h-9 px-3 rounded-lg bg-muted/50 border border-border/50 text-xs focus:outline-none focus:ring-2 focus:ring-gold/30 placeholder:text-muted-foreground"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tastingNote.overall}
                onChange={(e) =>
                  setTastingNote((prev) => ({
                    ...prev,
                    overall: e.target.value,
                  }))
                }
                placeholder="Overall impression..."
                className="flex-1 h-9 px-3 rounded-lg bg-muted/50 border border-border/50 text-xs focus:outline-none focus:ring-2 focus:ring-gold/30 placeholder:text-muted-foreground"
              />
              <button
                onClick={() => {
                  if (!sessionId) return;
                  saveTastingNote.mutate(
                    {
                      sessionId,
                      aroma: tastingNote.aroma,
                      flavor: tastingNote.flavor,
                      mouthfeel: tastingNote.mouthfeel,
                      overall: tastingNote.overall,
                    },
                    {
                      onSuccess: () =>
                        setTastingNote({
                          aroma: "",
                          flavor: "",
                          mouthfeel: "",
                          overall: "",
                        }),
                    }
                  );
                }}
                disabled={saveTastingNote.isPending || !sessionId}
                className="px-4 h-9 rounded-lg bg-gold text-gold-foreground text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
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
            <span className="ml-auto text-[10px] text-muted-foreground">
              {(messages ?? []).length} messages
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {(messages ?? []).map((msg: any) => (
              <div key={msg.id} className="animate-fade-in">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold">
                    {msg.profiles?.username ?? "Anonymous"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {msg.created_at
                      ? new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "now"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pl-0">
                  {msg.message}
                </p>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-border/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Say something..."
                className="flex-1 h-9 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 placeholder:text-muted-foreground"
              />
              <button
                onClick={handleSend}
                disabled={sendMessage.isPending || !input.trim()}
                className="w-9 h-9 rounded-lg bg-teal text-teal-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {sendMessage.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTastingPanel;