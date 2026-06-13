import { TrendingDown, TrendingUp } from "lucide-react"
import { useReadings } from "@/hooks/useReadings"

interface ReadingsTableProps {
  batchId?: string
}

const ReadingsTable = ({ batchId }: ReadingsTableProps) => {
  const { data: readings, isLoading } = useReadings(batchId)

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border/50">
        <h3 className="font-slab font-semibold text-sm">Recent Readings</h3>
      </div>
      {isLoading ? (
        <div className="p-4 space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-8 bg-muted/50 rounded animate-pulse"/>)}
        </div>
      ) : (readings ?? []).length === 0 ? (
        <p className="text-xs text-muted-foreground p-4 text-center">No readings yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Date</th>
                <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">SG</th>
                <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">°F</th>
                <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">pH</th>
                <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {(readings ?? []).slice(0, 8).map((r, i) => {
                const prev = readings?.[i + 1]
                const trend = prev
                  ? r.gravity < prev.gravity ? "down"
                  : r.gravity > prev.gravity ? "up" : "stable"
                  : "stable"
                return (
                  <tr key={r.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-medium">
                      {new Date(r.read_at ?? "").toLocaleDateString(undefined,
                        { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-copper">
                      {Number(r.gravity).toFixed(3)}
                    </td>
                    <td className="px-4 py-2.5 text-right">{r.temp_f ?? "—"}</td>
                    <td className="px-4 py-2.5 text-right">{r.ph ?? "—"}</td>
                    <td className="px-4 py-2.5 text-right">
                      {trend === "down" ? (
                        <TrendingDown size={14} className="text-teal inline" />
                      ) : trend === "up" ? (
                        <TrendingUp size={14} className="text-copper inline" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ReadingsTable
