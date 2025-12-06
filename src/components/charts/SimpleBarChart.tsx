'use client';

interface BarData { label: string; value: number; color?: string; }

export default function SimpleBarChart({ data, height = 200, horizontal = false }: { data: BarData[]; height?: number; horizontal?: boolean }) {
  if (data.length === 0) return <div className="flex items-center justify-center text-gray-400" style={{ height }}>No data</div>;

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (horizontal) {
    return (
      <div className="space-y-3">
        {data.map((d, i) => (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 truncate max-w-[60%]">{d.label}</span>
              <span className="text-gray-500">{d.value}</span>
            </div>
            <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(d.value / maxValue) * 100}%`, backgroundColor: d.color || colors[i % colors.length] }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-end justify-around" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 px-1">
          <span className="text-xs text-gray-500 mb-1">{d.value}</span>
          <div className="w-full max-w-8 rounded-t" style={{ height: `${(d.value / maxValue) * (height - 40)}px`, backgroundColor: d.color || colors[i % colors.length] }} />
          <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
