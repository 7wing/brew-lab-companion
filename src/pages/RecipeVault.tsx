import { useState } from "react";
import { Search, FlaskConical, Filter, Star, Clock, Percent } from "lucide-react";

const recipes = [
  { id: "1", title: "New England IPA", type: "beer", abv: 6.5, time: 14, difficulty: 3, ingredients: ["Citra", "Mosaic", "Oats", "London III"], starred: true },
  { id: "2", title: "Lavender Kombucha", type: "kombucha", abv: 0.5, time: 14, difficulty: 1, ingredients: ["Green Tea", "Lavender", "SCOBY", "Sugar"], starred: false },
  { id: "3", title: "Orange Blossom Mead", type: "mead", abv: 12, time: 90, difficulty: 2, ingredients: ["Wildflower Honey", "Orange Peel", "D47 Yeast"], starred: true },
  { id: "4", title: "Dry Farmhouse Cider", type: "cider", abv: 7, time: 28, difficulty: 2, ingredients: ["Fresh Apple Juice", "Champagne Yeast", "Pectic Enzyme"], starred: false },
  { id: "5", title: "Classic Sourdough Loaf", type: "sourdough", abv: 0, time: 3, difficulty: 2, ingredients: ["Bread Flour", "Rye Flour", "Starter", "Salt"], starred: false },
  { id: "6", title: "Belgian Dubbel", type: "beer", abv: 7.5, time: 21, difficulty: 3, ingredients: ["Pilsner Malt", "Dark Candi", "WLP500", "Saaz"], starred: true },
  { id: "7", title: "Tepache", type: "ferment", abv: 2, time: 5, difficulty: 1, ingredients: ["Pineapple Rind", "Piloncillo", "Cinnamon", "Clove"], starred: false },
  { id: "8", title: "Spicy Kimchi", type: "ferment", abv: 0, time: 7, difficulty: 1, ingredients: ["Napa Cabbage", "Gochugaru", "Fish Sauce", "Ginger"], starred: false },
];

const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
  beer: { label: "Beer", color: "text-copper", bg: "bg-copper/10 border-copper/20" },
  kombucha: { label: "Kombucha", color: "text-teal", bg: "bg-teal/10 border-teal/20" },
  mead: { label: "Mead", color: "text-gold", bg: "bg-gold/10 border-gold/20" },
  cider: { label: "Cider", color: "text-copper", bg: "bg-copper/10 border-copper/15" },
  sourdough: { label: "Sourdough", color: "text-gold", bg: "bg-gold/10 border-gold/15" },
  ferment: { label: "Ferment", color: "text-teal", bg: "bg-teal/10 border-teal/15" },
};

const filters = ["All", "Beer", "Kombucha", "Mead", "Cider", "Sourdough", "Ferment"];

const RecipeVault = () => {
  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = recipes.filter(
    (r) =>
      (active === "All" || r.type === active.toLowerCase()) &&
      r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-slab text-2xl md:text-3xl font-bold">Recipe Vault</h1>
          <p className="text-muted-foreground text-sm mt-1">{recipes.length} recipes catalogued</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal to-teal/80 text-teal-foreground font-medium text-sm shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
          <FlaskConical size={16} />
          New Recipe
        </button>
      </div>

      {/* Search + Filters */}
      <div className="glass-panel rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 transition-all placeholder:text-muted-foreground"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 text-sm text-muted-foreground hover:bg-muted transition-colors sm:hidden">
            <Filter size={14} /> Filters
          </button>
        </div>
        <div className="hidden sm:flex gap-2 mt-3 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                active === f
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filtered.map((recipe) => {
          const config = typeConfig[recipe.type];
          return (
            <div
              key={recipe.id}
              className={`glass-panel rounded-xl p-4 border ${config.bg} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-[10px] font-semibold uppercase tracking-widest ${config.color}`}>
                  {config.label}
                </span>
                {recipe.starred && <Star size={14} className="text-gold fill-gold" />}
              </div>
              <h3 className="font-slab font-semibold text-base mb-3">{recipe.title}</h3>

              <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                {recipe.abv > 0 && (
                  <span className="flex items-center gap-1">
                    <Percent size={12} /> {recipe.abv}% ABV
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {recipe.time}d
                </span>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        i < recipe.difficulty ? "bg-copper" : "bg-muted"
                      }`}
                    />
                  ))}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {recipe.ingredients.slice(0, 3).map((ing, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground"
                  >
                    {ing}
                  </span>
                ))}
                {recipe.ingredients.length > 3 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground">
                    +{recipe.ingredients.length - 3}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Featured Lab Partner */}
      <div className="mt-8 glass-panel rounded-xl p-5 border-copper/20 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-copper/20 flex items-center justify-center shrink-0">
          <FlaskConical size={24} className="text-copper" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-widest text-copper font-semibold mb-1">Featured Yeast — Lab Partner</p>
          <p className="text-sm font-medium">Belgian Saison WLP565</p>
          <p className="text-xs text-muted-foreground mt-0.5">Perfect for farmhouse ales. High attenuation, complex phenolics. Supplied by BrewCraft Yeasts.</p>
        </div>
      </div>
    </div>
  );
};

export default RecipeVault;
