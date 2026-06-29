import React from 'react';
import { fmt } from '../../utils/format';

export interface BarListItem {
  rank: number;
  name: string;
  value: number;
  max: number;
  color?: string;
  isBottom?: boolean;
}

interface BarListProps {
  items: BarListItem[];
}

export const BarList: React.FC<BarListProps> = ({ items }) => (
  <div className="barlist">
    {items.map((item) => (
      <div key={item.name} className="barlist-row">
        <span className="barlist-rank">{item.rank}</span>
        <div className="barlist-mid">
          <div className="barlist-name">{item.name}</div>
          <div className="barlist-track">
            <div
              className="barlist-fill"
              style={{
                width: `${item.max > 0 ? (item.value / item.max) * 100 : 0}%`,
                background: item.isBottom
                  ? 'var(--amber-500)'
                  : (item.color ?? 'var(--blue-500)'),
              }}
            />
          </div>
        </div>
        <span className="barlist-val tnum">{fmt(item.value)}</span>
      </div>
    ))}
  </div>
);
