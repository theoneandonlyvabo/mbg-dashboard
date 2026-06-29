import { useState, useMemo } from 'react';
import { HIERARCHY, DEFAULT_FILTER } from '../data/constants';
import { RECORDS } from '../data/records';
import type { FilterState, MBGRecord } from '../types';

export interface UseFilterReturn {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilter: () => void;
  filteredRecords: MBGRecord[];
  allProvs: string[];
  availableKabs: string[];
  availableKecs: string[];
}

export function useFilter(): UseFilterReturn {
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);

  const allProvs = useMemo(() => {
    const set = new Set<string>();
    for (const r of RECORDS) set.add(r.p);
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'id'));
  }, []);

  const availableKabs = useMemo(() => {
    if (filter.prov === 'ALL') return [];
    const hier = HIERARCHY[filter.prov];
    if (!hier) return [];
    return Object.keys(hier).sort((a, b) => a.localeCompare(b, 'id'));
  }, [filter.prov]);

  const availableKecs = useMemo(() => {
    if (filter.prov === 'ALL' || filter.kab === 'ALL') return [];
    return HIERARCHY[filter.prov]?.[filter.kab] ?? [];
  }, [filter.prov, filter.kab]);

  const filteredRecords = useMemo(() => {
    return RECORDS.filter((r: MBGRecord) => {
      if (filter.prov !== 'ALL' && r.p !== filter.prov) return false;
      if (filter.kab !== 'ALL' && r.k !== filter.kab) return false;
      if (filter.kec !== 'ALL' && r.c !== filter.kec) return false;
      if (filter.jenjang !== 'ALL' && r.j !== filter.jenjang) return false;
      if (filter.status === 'N' && r.sn === 0) return false;
      if (filter.status === 'S' && r.ss === 0) return false;
      return true;
    });
  }, [filter]);

  const resetFilter = () => setFilter(DEFAULT_FILTER);

  return { filter, setFilter, resetFilter, filteredRecords, allProvs, availableKabs, availableKecs };
}
