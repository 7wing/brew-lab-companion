import { useState } from "react";
import { MessageSquare, Heart, Share2, ChevronLeft, ChevronRight, FlaskConical } from "lucide-react";

const tabs = ["Recipes Shared", "Troubleshooting", "Tastings"];

const posts = [
  {
    id: 1,
    tab: 0,
    author: "BrewerMike",
    title: "My Best NEIPA Recipe Yet — Cryo Citra Bomb",
    content: "After 12 iterations, I've nailed the haze and juicy tropical character. Key changes: increased oat percentage to 20%, used Cryo Citra at whirlpool only, and fermented with Imperial A38.",
    likes: 47,
    comments: 12,
    type: "beer",
  },
  {
    id: 2,
    tab: 0,
    author: "KombuchaKate",
    title: "Elderflower Kombucha — Spring Batch",
    content: "Used dried elderflowers in F2. 2 tbsp per 16oz bottle, 3 days at room temp. Beautiful floral notes with natural carbonation. The SCOBY is loving green tea this season.",
    likes: 34,
    comments: 8,
    type: "kombucha",
  },
  {
    id: 3,
    tab: 1,
    author: "FermentNovice",
    title: "Stuck Fermentation at 1.030 — Help!",
    content: "My porter has been sitting at 1.030 for 5 days. OG was 1.058. Yeast was WLP001, pitched at 65°F. Should I repitch or raise temp?",
    likes: 5,
    comments: 23,
    type: "beer",
  },
  {
    id: 4,
    tab: 2,
    author: "MeadMaven",
    title: "6-Month Orange Blossom Mead Tasting Notes",
    content: "Finally cracked open my OB mead. Golden color, sweet honey upfront with citrus peel on the finish. Needs another 6 months but showing great promise. ABV landed at 13.2%.",
    likes: 62,
    comments: 15,
    type: "mead",
  },
  {
    id: 5,
    tab: 1,
    author: "SourdoughSam",
    title: "Starter won't rise past 50% — Day 7",
    content: "Using KA bread flour, 1:1:1 ratio, feeding every 12 hours at 78°F. Getting bubbles but no real doubling. Switched to rye today. Any tips?",
    likes: 8,
    comments: 19,
    type: "sourdough",
  },
];

const typeAccent: Record<string, string> = {
  beer: "text-copper",
  kombucha: "text-teal",
  mead: "text-gold",
  sourdough: "text-gold",
};

const Community = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);

  const filtered = posts.filter((p) => p.tab === activeTab);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-slab text-2xl md:text-3xl font-bold">Community Ferment</h1>
        <p className="text-muted-foreground text-sm mt-1">Lab notebooks from fellow brewers</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 glass-panel rounded-xl p-1 w-fit">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(i); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === i
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4 max-w-3xl">
        {filtered.map((post) => (
          <article
            key={post.id}
            className="glass-panel rounded-xl p-5 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-copper/20 to-teal/20 border border-border flex items-center justify-center">
                <FlaskConical size={14} className={typeAccent[post.type] || "text-copper"} />
              </div>
              <div>
                <p className="text-sm font-semibold">{post.author}</p>
                <p className={`text-[10px] uppercase tracking-widest ${typeAccent[post.type]}`}>{post.type}</p>
              </div>
            </div>
            <h3 className="font-slab font-semibold text-base mb-2">{post.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{post.content}</p>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/30">
              <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-copper transition-colors">
                <Heart size={14} /> {post.likes}
              </button>
              <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-teal transition-colors">
                <MessageSquare size={14} /> {post.comments}
              </button>
              <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition-colors ml-auto">
                <Share2 size={14} /> Share
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3 mt-8">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          className="p-2 rounded-lg glass-panel hover:bg-muted transition-colors"
          disabled={page === 1}
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium px-3">Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          className="p-2 rounded-lg glass-panel hover:bg-muted transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Community;
