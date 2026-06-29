import { useState, useCallback } from 'react';
import type { TooltipState } from '../types';

export function useTooltip() {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false, x: 0, y: 0, title: '', rows: [],
  });

  const showTooltip = useCallback(
    (e: React.MouseEvent, title: string, rows: [string, string][]) => {
      const px = Math.min(e.clientX + 16, window.innerWidth - 256);
      const py = Math.min(e.clientY + 16, window.innerHeight - 100);
      setTooltip({ visible: true, x: px, y: py, title, rows });
    },
    []
  );

  const moveTooltip = useCallback((e: React.MouseEvent) => {
    const px = Math.min(e.clientX + 16, window.innerWidth - 256);
    const py = Math.min(e.clientY + 16, window.innerHeight - 100);
    setTooltip((prev) => ({ ...prev, x: px, y: py }));
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  return { tooltip, showTooltip, moveTooltip, hideTooltip };
}
