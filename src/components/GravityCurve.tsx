import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const data = [
  { day: "D1", gravity: 1.072, temp: 65 },
  { day: "D3", gravity: 1.065, temp: 66 },
  { day: "D5", gravity: 1.058, temp: 69 },
  { day: "D7", gravity: 1.052, temp: 67 },
  { day: "D9", gravity: 1.048, temp: 68 },
  { day: "D11", gravity: 1.042, temp: 68 },
  { day: "D13", gravity: 1.035, temp: 67 },
];

const GravityCurve = () => {
  return (
    <div className="glass-panel rounded-xl p-4">
      <h3 className="font-slab font-semibold text-sm mb-3">Gravity Curve — Amber Ale</h3>
      <div className="h-48 md:h-56">
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
      </div>
    </div>
  );
};

export default GravityCurve;
