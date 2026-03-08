import { TrendingDown, TrendingUp } from "lucide-react";

interface Reading {
  date: string;
  gravity: number;
  temp: number;
  ph: number;
  trend: "up" | "down" | "stable";
}

const readings: Reading[] = [
  { date: "Mar 7", gravity: 1.048, temp: 68, ph: 4.2, trend: "down" },
  { date: "Mar 5", gravity: 1.052, temp: 67, ph: 4.3, trend: "down" },
  { date: "Mar 3", gravity: 1.058, temp: 69, ph: 4.5, trend: "down" },
  { date: "Mar 1", gravity: 1.065, temp: 66, ph: 4.6, trend: "stable" },
  { date: "Feb 28", gravity: 1.072, temp: 65, ph: 4.8, trend: "up" },
];

const ReadingsTable = () => {
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border/50">
        <h3 className="font-slab font-semibold text-sm">Recent Readings</h3>
      </div>
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
            {readings.map((r, i) => (
              <tr key={i} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-2.5 font-medium">{r.date}</td>
                <td className="px-4 py-2.5 text-right font-mono text-copper">{r.gravity.toFixed(3)}</td>
                <td className="px-4 py-2.5 text-right">{r.temp}°</td>
                <td className="px-4 py-2.5 text-right">{r.ph}</td>
                <td className="px-4 py-2.5 text-right">
                  {r.trend === "down" ? (
                    <TrendingDown size={14} className="text-teal inline" />
                  ) : r.trend === "up" ? (
                    <TrendingUp size={14} className="text-copper inline" />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReadingsTable;
