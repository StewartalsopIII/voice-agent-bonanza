'use client';

interface DonutData { label: string; value: number; color: string; }

export default function SimpleDonutChart({ data, size = 180 }: { data: DonutData[]; size?: number }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return <div className="flex items-center justify-center text-gray-400" style={{ height: size }}>No data</div>;

  const strokeWidth = 35;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  let offset = 0;

  return (
    <div className="flex items-center justify-center gap-6">
      <svg width={size} height={size} className="-rotate-90">
        {data.map((d, i) => {
          const pct = d.value / total;
          const dash = `${pct * circumference} ${circumference}`;
          const currentOffset = offset;
          offset += pct * circumference;
          return <circle key={i} cx={center} cy={center} r={radius} fill="none" stroke={d.color} strokeWidth={strokeWidth} strokeDasharray={dash} strokeDashoffset={-currentOffset} />;
        })}
      </svg>
      <div className="space-y-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-gray-600">{d.label} ({d.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
