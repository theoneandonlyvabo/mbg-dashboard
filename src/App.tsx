import { useState, useCallback } from 'react';
import './index.css';
import './components/layout/Topbar.css';
import './components/layout/NavTabs.css';

import { useFilter } from './hooks/useFilter';
import { useTooltip } from './hooks/useTooltip';

import { Topbar } from './components/layout/Topbar';
import { NavTabs } from './components/layout/NavTabs';
import { Tooltip } from './components/ui/Tooltip';

import { Sec1Executive } from './components/sections/Sec1Executive';
import { Sec2Wilayah } from './components/sections/Sec2Wilayah';
import { Sec3Demografi } from './components/sections/Sec3Demografi';
import {
  Sec4KondisiKhusus,
  Sec5PenerimaManfaat,
  Sec6Sekolah,
  Sec7Tren,
  Sec8DeepDive,
  Sec9InsightEngine,
} from './components/sections/Sec4to9';

import type { NavSection } from './types';

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('sec1');
  const { filter, setFilter, resetFilter, filteredRecords, allProvs, availableKabs, availableKecs } = useFilter();
  const { tooltip } = useTooltip();

  const handleProvSelect = useCallback((prov: string) => {
    setFilter(f => ({
      ...f,
      prov: prov === 'ALL' ? 'ALL' : prov,
      kab: 'ALL',
      kec: 'ALL',
    }));
  }, [setFilter]);

  return (
    <>
      <Topbar
        filter={filter}
        setFilter={setFilter}
        resetFilter={resetFilter}
        allProvs={allProvs}
        availableKabs={availableKabs}
        availableKecs={availableKecs}
      />

      <div className="wrap">
        <NavTabs activeSection={activeSection} onTabClick={setActiveSection} />

        <Sec1Executive records={filteredRecords} />
        <Sec2Wilayah
          records={filteredRecords}
          onProvSelect={handleProvSelect}
          selectedProv={filter.prov}
        />
        <Sec3Demografi records={filteredRecords} />
        <Sec4KondisiKhusus records={filteredRecords} />
        <Sec5PenerimaManfaat records={filteredRecords} />
        <Sec6Sekolah records={filteredRecords} />
        <Sec7Tren />
        <Sec8DeepDive records={filteredRecords} />
        <Sec9InsightEngine records={filteredRecords} />

        <footer className="dash-footer">
          <div className="fcol">
            <span>&copy; 2026 Program MBG &middot; Business Intelligence Dashboard</span>
            <span>{filteredRecords.length.toLocaleString('id-ID')} baris data aktif</span>
          </div>
          <div className="fcol">
            <span>Mata Kuliah Business Intelligence &middot; UPN Veteran Jakarta</span>
            <span>ETL Data Nasional MBG &mdash; snapshot per kecamatan</span>
          </div>
        </footer>
      </div>

      <Tooltip state={tooltip} />
    </>
  );
}
