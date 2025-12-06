'use client';

interface DataPoint { label: string; value: number; }

export default function SimpleLineChart({ data, height = 200, color = '#3B82F6' }: { data: DataPoint[]; height?: number; color?: string }) {
  if (data.length === 0) return <div className="flex items-center justify-center text-gray-400" style={{ height }}>No data</div>;

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartHeight = height - 40;

  return (
    <div style={{ height }}>
      <svg viewBox={`0 0 100 ${chartHeight}`} preserveAspectRatio="none" className="w-full" style={{ height: chartHeight }}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line key={y} x1="0%" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="#E5E7EB" strokeWidth="0.5" />
        ))}
        {/* Area */}
        <path
          d={data.map((d, i) => {
            const x = (i / (data.length - 1 || 1)) * 100;
            const y = ((maxValue - d.value) / maxValue) * 100;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
          }).join(' ') + ` L 100 100 L 0 100 Z`}
          fill={`${color}20`}
        />
        {/* Line */}
        <path
          d={data.map((d, i) => {
            const x = (i / (data.length - 1 || 1)) * 100;
            const y = ((maxValue - d.value) / maxValue) * 100;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
          }).join(' ')}
          fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke"
        />
      </svg>
      {data.length <= 14 && (
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          {data.filter((_, i) => i % Math.ceil(data.length / 7) === 0).map((d, i) => <span key={i}>{d.label}</span>)}
        </div>
      )}
    </div>
  );
}
