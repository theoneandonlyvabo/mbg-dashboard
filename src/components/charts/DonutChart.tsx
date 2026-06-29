import React from 'react';

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  slices: DonutSlice[];
  size?: number;
  innerRadius?: number;
  outerRadius?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  slices, size = 140, innerRadius = 44, outerRadius = 65,
}) => {
  const total = slices.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="empty-state"><span>Tidak ada data</span></div>;

  const cx = size / 2;
  const cy = size / 2;
  let currentAngle = -90;

  const paths = slices.map((slice) => {
    const angle = (slice.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const rad = (a: number) => (a * Math.PI) / 180;
    const x1 = cx + outerRadius * Math.cos(rad(startAngle));
    const y1 = cy + outerRadius * Math.sin(rad(startAngle));
    const x2 = cx + outerRadius * Math.cos(rad(endAngle));
    const y2 = cy + outerRadius * Math.sin(rad(endAngle));
    const ix1 = cx + innerRadius * Math.cos(rad(endAngle));
    const iy1 = cy + innerRadius * Math.sin(rad(endAngle));
    const ix2 = cx + innerRadius * Math.cos(rad(startAngle));
    const iy2 = cy + innerRadius * Math.sin(rad(startAngle));
    const large = angle > 180 ? 1 : 0;

    return (
      <path
        key={slice.label}
        d={`M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerRadius} ${innerRadius} 0 ${large} 0 ${ix2} ${iy2} Z`}
        fill={slice.color}
      />
    );
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>{paths}</svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {slices.map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: s.color, display: 'inline-block' }} />
            <span style={{ color: 'var(--ink-700)', fontWeight: 600 }}>{s.label}</span>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--navy-900)', marginLeft: 'auto', fontWeight: 700 }}>
              {((s.value / total) * 100).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
