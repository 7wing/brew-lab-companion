import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface Reading {
  read_at: string;
  gravity: number;
  temp_f: number | null;
}

interface GravityCurveProps {
  readings?: Reading[];
}

function formatDay(readAt: string) {
  const d = new Date(readAt);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const GravityCurve = ({ readings }: GravityCurveProps) => {
  const data = (readings ?? [])
    .slice()
    .sort((a, b) => new Date(a.read_at).getTime() - new Date(b.read_at).getTime())
    .map((r) => ({
      day: formatDay(r.read_at),
      gravity: Number(r.gravity),
      temp: r.temp_f ?? 0,
    }));

  const hasData = data.length > 0;

  return (
    <div className="glass-panel rounded-xl p-4">
      <h3 className="font-slab font-semibold text-sm mb-3">
        Gravity Curve
      </h3>
      <div className="h-48 md:h-56">
        {!hasData ? (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No readings yet
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gravityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(25, 60%, 46%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(25, 60%, 46%)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" strokeOpacity={0.4} />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(215, 12%, 50%)" />
            <YAxis domain={[1.02, 1.08]} tick={{ fontSize: 11 }} stroke="hsl(215, 12%, 50%)" tickFormatter={(v: number) => v.toFixed(3)} />
            <Tooltip
              contentStyle={{
                background: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(214, 20%, 88%)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [value.toFixed(3), "SG"]}
            />
            <Area
              type="monotone"
              dataKey="gravity"
              stroke="hsl(25, 60%, 46%)"
              strokeWidth={2}
              fill="url(#gravityGrad)"
              dot={{ r: 4, fill: "hsl(25, 60%, 46%)", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "hsl(25, 60%, 46%)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default GravityCurve;
