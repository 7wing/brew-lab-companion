import { useSearchParams } from "react-router-dom";
import { Search, FlaskConical, Users, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  const { data: recipeResults, isLoading: recipesLoading } = useQuery({
    queryKey: ["search", "recipes", q],
    queryFn: async () => {
      if (!q.trim()) return [];
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .textSearch("fts", q.trim(), { type: "websearch" })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
    enabled: q.trim().length > 0,
  });

  const { data: postResults, isLoading: postsLoading } = useQuery({
    queryKey: ["search", "posts", q],
    queryFn: async () => {
      if (!q.trim()) return [];
      const term = `%${q.trim()}%`;
      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles(username)")
        .or(`title.ilike.${term},content.ilike.${term}`)
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
    enabled: q.trim().length > 0,
  });

  const isLoading = recipesLoading || postsLoading;
  const hasResults =
    (recipeResults?.length ?? 0) > 0 || (postResults?.length ?? 0) > 0;

  return (
    <div className="animate-fade-in">
      <h1 className="font-slab text-2xl md:text-3xl font-bold mb-2">
        Search Results
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        {q ? `Results for "${q}"` : "Enter a search term to find recipes and posts."}
      </p>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Searching…</span>
        </div>
      )}

      {!isLoading && !q.trim() && (
        <div className="glass-panel rounded-xl p-8 text-center">
          <Search size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Use the search bar above to find recipes and community posts.
          </p>
        </div>
      )}

      {!isLoading && q.trim() && !hasResults && (
        <div className="glass-panel rounded-xl p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No results found for "{q}".
          </p>
        </div>
      )}

      {!isLoading && hasResults && (
        <div className="space-y-8">
          {recipeResults && recipeResults.length > 0 && (
            <section>
              <h2 className="font-slab font-semibold text-lg mb-4 flex items-center gap-2">
                <FlaskConical size={18} className="text-copper" />
                Recipes ({recipeResults.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recipeResults.map((r: any) => (
                  <div
                    key={r.id}
                    className="glass-panel rounded-xl p-4 border hover:shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-copper mb-1">
                      {r.type}
                    </p>
                    <h3 className="font-slab font-semibold text-sm">{r.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {r.description || "No description"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {postResults && postResults.length > 0 && (
            <section>
              <h2 className="font-slab font-semibold text-lg mb-4 flex items-center gap-2">
                <Users size={18} className="text-teal" />
                Community Posts ({postResults.length})
              </h2>
              <div className="space-y-3 max-w-3xl">
                {postResults.map((p: any) => (
                  <div
                    key={p.id}
                    className="glass-panel rounded-xl p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold">
                        {p.profiles?.username || "Anonymous"}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase">
                        {p.category}
                      </span>
                    </div>
                    <h3 className="font-slab font-semibold text-sm">{p.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {p.content}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Mobile: add bottom padding so bottom nav doesn't obscure content */}
      <div className="h-16 lg:hidden" />
    </div>
  );
}
