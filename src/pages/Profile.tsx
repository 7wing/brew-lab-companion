import { FlaskConical, Award, Users, Beaker, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const badges = [
  { name: "First Brew", icon: "🍺" },
  { name: "Kombucha King", icon: "🫖" },
  { name: "100 Readings", icon: "📊" },
  { name: "Community Star", icon: "⭐" },
  { name: "Mead Master", icon: "🍯" },
];

const batches = [
  { name: "Autumn Amber Ale", type: "beer", status: "Active" },
  { name: "Ginger Kombucha F2", type: "kombucha", status: "Active" },
  { name: "Wildflower Mead", type: "mead", status: "Active" },
  { name: "Holiday Porter", type: "beer", status: "Completed" },
  { name: "Jun Green Tea", type: "kombucha", status: "Completed" },
];

const AccordionSection = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <span className="flex items-center gap-2 font-slab font-semibold text-sm">
          <Icon size={16} className="text-copper" /> {title}
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
};

const Profile = () => {
  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="glass-panel rounded-xl p-6 mb-6 text-center">
        <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-br from-copper/30 to-teal/30 border-2 border-copper/40 flex items-center justify-center mb-4">
          <FlaskConical size={32} className="text-copper" />
        </div>
        <h1 className="font-slab text-xl font-bold">BrewerAlex</h1>
        <p className="text-sm text-muted-foreground mt-1">Homebrewer since 2019 · Portland, OR</p>
        <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">
          Passionate about NEIPAs, wild fermentation, and sourdough experimentation. Always looking for the perfect hop combo.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 max-w-sm mx-auto">
          {[
            { label: "Batches", value: "28", color: "text-copper" },
            { label: "Recipes", value: "15", color: "text-teal" },
            { label: "Following", value: "42", color: "text-gold" },
          ].map((s, i) => (
            <div key={i}>
              <p className={`text-2xl font-mono font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Batch shelf */}
      <div className="glass-panel rounded-xl p-4 mb-4">
        <h3 className="font-slab font-semibold text-sm mb-3">Batch Shelf</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {batches.map((b, i) => (
            <div
              key={i}
              className="shrink-0 px-3 py-2 rounded-lg bg-muted/40 border border-border/40 text-center min-w-[120px]"
            >
              <p className="text-xs font-medium truncate">{b.name}</p>
              <p className={`text-[10px] mt-0.5 ${b.status === "Active" ? "text-teal" : "text-muted-foreground"}`}>
                {b.status}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Accordion sections */}
      <div className="space-y-3">
        <AccordionSection title="Awards & Badges" icon={Award}>
          <div className="flex flex-wrap gap-3">
            {badges.map((b, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border/30">
                <span className="text-lg">{b.icon}</span>
                <span className="text-xs font-medium">{b.name}</span>
              </div>
            ))}
          </div>
        </AccordionSection>

        <AccordionSection title="Yeast Bank" icon={Beaker}>
          <div className="space-y-2">
            {["WLP001 — California Ale", "WLP500 — Monastery Ale", "Imperial A38 — Juice", "Safale US-05"].map((y, i) => (
              <div key={i} className="text-sm px-3 py-2 rounded-lg bg-muted/30 border border-border/20">
                {y}
              </div>
            ))}
          </div>
        </AccordionSection>

        <AccordionSection title="Connections" icon={Users}>
          <p className="text-sm text-muted-foreground">42 brewers connected</p>
        </AccordionSection>
      </div>
    </div>
  );
};

export default Profile;
