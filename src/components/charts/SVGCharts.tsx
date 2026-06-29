import React from 'react';

export interface LinePoint {
  x: number;
  y: number;
  label: string;
  value: number;
}

interface SVGLineChartProps {
  data: LinePoint[];
  color?: string;
  fillColor?: string;
  height?: number;
  showArea?: boolean;
}

export const SVGLineChart: React.FC<SVGLineChartProps> = ({
  data, color = '#3D87D6', fillColor = 'rgba(61,135,214,0.12)',
  height = 160, showArea = true,
}) => {
  if (!data.length) return null;
  const W = 500;
  const H = height;
  const PAD = { top: 16, right: 20, bottom: 30, left: 44 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const toX = (i: number) => PAD.left + (i / (data.length - 1)) * iW;
  const toY = (v: number) => PAD.top + iH - (v / maxVal) * iH;

  const pts = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(' ');
  const areaPath = `M ${toX(0)} ${toY(0)} L ${pts.replace(/,/g, ' L ').split(' L ').slice(0).join(' L ')} L ${toX(data.length - 1)} ${PAD.top + iH} L ${toX(0)} ${PAD.top + iH} Z`;
  const linePath = `M ${pts.replace(',', ' ').split(' ').map((v, i) => i % 2 === 0 ? `${v},` : v).join(' ')}`;

  // nicer path
  const pathD = data.map((d, i) =>
    `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.value)}`
  ).join(' ');

  const areaD = `${pathD} L ${toX(data.length - 1)} ${PAD.top + iH} L ${toX(0)} ${PAD.top + iH} Z`;

  const fmtShort = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`;
    return String(v);
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" style={{ maxHeight: height }}>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map(p => {
        const y = PAD.top + iH - p * iH;
        return (
          <g key={p}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
              stroke="var(--line)" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end"
              fontSize="9" fill="var(--ink-400)" fontFamily="var(--f-mono)">
              {fmtShort(maxVal * p)}
            </text>
          </g>
        );
      })}

      {/* Area */}
      {showArea && <path d={areaD} fill={fillColor} />}

      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Points */}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(d.value)} r="4" fill={color} stroke="#fff" strokeWidth="1.5" />
          <text x={toX(i)} y={H - 6} textAnchor="middle"
            fontSize="9.5" fill="var(--ink-400)" fontFamily="var(--f-mono)">
            {d.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

// Stacked Bar Chart
export interface StackedBarGroup {
  label: string;
  segments: { value: number; color: string; name: string }[];
}

interface StackedBarChartProps {
  groups: StackedBarGroup[];
  height?: number;
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({ groups, height = 200 }) => {
  if (!groups.length) return null;
  const W = 500;
  const H = height;
  const PAD = { top: 16, right: 16, bottom: 36, left: 44 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;

  const totals = groups.map(g => g.segments.reduce((s, seg) => s + seg.value, 0));
  const maxTotal = Math.max(...totals, 1);
  const barW = (iW / groups.length) * 0.65;
  const gap = iW / groups.length;

  const fmtShort = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`;
    return String(v);
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" style={{ maxHeight: height }}>
      {[0.25, 0.5, 0.75, 1].map(p => {
        const y = PAD.top + iH - p * iH;
        return (
          <g key={p}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="var(--line)" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end"
              fontSize="9" fill="var(--ink-400)" fontFamily="var(--f-mono)">
              {fmtShort(maxTotal * p)}
            </text>
          </g>
        );
      })}
      {groups.map((g, gi) => {
        const x = PAD.left + gi * gap + (gap - barW) / 2;
        let curY = PAD.top + iH;
        return (
          <g key={gi}>
            {g.segments.map((seg, si) => {
              const barH = (seg.value / maxTotal) * iH;
              const y = curY - barH;
              curY = y;
              return <rect key={si} x={x} y={y} width={barW} height={barH}
                fill={seg.color} rx={si === g.segments.length - 1 ? 3 : 0} />;
            })}
            <text x={x + barW / 2} y={H - 6} textAnchor="middle"
              fontSize="9" fill="var(--ink-400)" fontFamily="var(--f-mono)">
              {g.label.length > 5 ? g.label.slice(0, 4) + '…' : g.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
