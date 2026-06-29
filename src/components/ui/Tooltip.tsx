import React from 'react';
import type { TooltipState } from '../../types';

interface TooltipProps {
  state: TooltipState;
}

export const Tooltip: React.FC<TooltipProps> = ({ state }) => (
  <div
    className={`viz-tooltip${state.visible ? ' show' : ''}`}
    style={{ left: state.x, top: state.y }}
  >
    <div className="tt-title">{state.title}</div>
    {state.rows.map(([label, value], i) => (
      <div key={i} className="tt-row">
        <span>{label}</span>
        <b>{value}</b>
      </div>
    ))}
  </div>
);
