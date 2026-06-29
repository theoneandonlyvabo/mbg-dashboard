import React, { useMemo, useState, useEffect, useRef } from 'react';
import type { MBGRecord } from '../../types';
import { groupBy } from '../../utils/aggregation';
import { fmt } from '../../utils/format';
import { SEQ } from '../../data/constants';
import { BarList } from '../charts/BarList';

interface Sec2Props {
  records: MBGRecord[];
  onProvSelect?: (prov: string) => void;
  selectedProv?: string;
}

// Simplified Indonesia SVG paths (key provinces)
// We'll use a simplified choropleth with province names mapped to rough shapes
const PROV_COLORS_RANGE = SEQ;

export const Sec2Wilayah: React.FC<Sec2Props> = ({ records, onProvSelect, selectedProv }) => {
  const [mapSvg, setMapSvg] = useState<string>('');

  const byProv = useMemo(() => groupBy(records, r => r.p), [records]);
  const provArr = useMemo(() =>
    Object.entries(byProv)
      .map(([name, agg]) => ({ name, pm: agg.pm, s: agg.s, kk: agg.kk }))
      .filter(p => p.pm > 0)
      .sort((a, b) => b.pm - a.pm),
    [byProv]
  );

  const maxPM = provArr[0]?.pm ?? 1;
  const minPM = provArr[provArr.length - 1]?.pm ?? 0;

  const getColor = (pm: number): string => {
    if (maxPM === minPM) return PROV_COLORS_RANGE[4];
    const t = (pm - minPM) / (maxPM - minPM);
    const idx = Math.min(Math.floor(t * (PROV_COLORS_RANGE.length - 1)), PROV_COLORS_RANGE.length - 2);
    return PROV_COLORS_RANGE[Math.round(t * (PROV_COLORS_RANGE.length - 1))];
  };

  const top10 = provArr.slice(0, 10).map((p, i) => ({
    rank: i + 1, name: p.name, value: p.pm, max: maxPM,
  }));

  const bottom10 = provArr.slice(-10).reverse().map((p, i) => ({
    rank: provArr.length - i, name: p.name, value: p.pm, max: maxPM, isBottom: true,
  }));

  // Load Indonesia SVG map
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia.geojson')
      .then(r => r.json())
      .then(geo => {
        // We'll render a D3-style SVG using the geojson
        // For now, render a placeholder choropleth grid
        setMapSvg('loaded');
      })
      .catch(() => setMapSvg('error'));
  }, []);

  const totalProvs = provArr.length;
  const totalKecs = new Set(records.map(r => r.c)).size;

  return (
    <section className="section" id="sec2">
      <div className="sec-head">
        <div className="lt">
          <span className="sec-num">02</span>
          <h2 className="sec-title">Analisis Wilayah</h2>
        </div>
        <p className="sec-desc">Distribusi geografis penerima manfaat — klik provinsi untuk filter drill-down</p>
      </div>

      <div className="grid g-2-13">
        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-title">Distribusi Penerima Manfaat per Provinsi</p>
              <p className="panel-sub">Choropleth — semakin gelap = penerima manfaat lebih tinggi</p>
            </div>
            <span className="panel-tag">{totalProvs} provinsi</span>
          </div>

          {/* Choropleth as treemap-style grid */}
          <ChoroplethGrid
            provArr={provArr}
            maxPM={maxPM}
            selectedProv={selectedProv ?? 'ALL'}
            onSelect={onProvSelect ?? (() => {})}
            getColor={getColor}
          />

          <div className="map-legend">
            <span>Rendah</span>
            <div className="lg-scale">
              {PROV_COLORS_RANGE.map((c, i) => (
                <span key={i} style={{ background: c }} />
              ))}
            </div>
            <span>Tinggi</span>
            <span style={{ marginLeft: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span className="legend-dot" style={{ background: '#EEF2F8', border: '1px solid #D7E1F0' }} />
              Belum lapor
            </span>
          </div>

          <div className="map-stat-strip">
            <div className="ms"><div className="n tnum">{totalProvs}</div><div className="l">Provinsi</div></div>
            <div className="ms"><div className="n tnum">{fmt(new Set(records.map(r => r.k)).size)}</div><div className="l">Kab/Kota</div></div>
            <div className="ms"><div className="n tnum">{fmt(totalKecs)}</div><div className="l">Kecamatan</div></div>
            <div className="ms"><div className="n tnum">{fmt(records.reduce((s,r) => s + r.pm, 0))}</div><div className="l">Total PM</div></div>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr', alignContent: 'start' }}>
          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-title">Top 10 Provinsi Tertinggi</p>
                <p className="panel-sub">Peringkat penerima manfaat terbanyak</p>
              </div>
            </div>
            <BarList items={top10} />
          </div>
          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-title">Bottom 10 Provinsi Terendah</p>
                <p className="panel-sub">Kandidat prioritas perluasan cakupan MBG</p>
              </div>
            </div>
            <BarList items={bottom10} />
          </div>
        </div>
      </div>
    </section>
  );
};

// Choropleth grid as responsive visual (since we can't load D3 SVG maps easily)
interface ChoroplethGridProps {
  provArr: { name: string; pm: number; s: number; kk: number }[];
  maxPM: number;
  selectedProv: string;
  onSelect: (p: string) => void;
  getColor: (pm: number) => string;
}

const ChoroplethGrid: React.FC<ChoroplethGridProps> = ({ provArr, maxPM, selectedProv, onSelect, getColor }) => {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
        gap: 4,
        maxHeight: 320,
        overflowY: 'auto',
        padding: 2,
      }}>
        {provArr.map(p => {
          const isSelected = selectedProv === p.name;
          const isHovered = hovered === p.name;
          return (
            <button
              key={p.name}
              onClick={() => onSelect(isSelected ? 'ALL' : p.name)}
              onMouseEnter={() => setHovered(p.name)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: getColor(p.pm),
                border: isSelected ? '2px solid var(--amber-500)' : isHovered ? '2px solid var(--navy-900)' : '1px solid rgba(255,255,255,0.3)',
                borderRadius: 6,
                padding: '8px 4px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                transition: 'filter .12s, border-color .12s',
                filter: isHovered ? 'brightness(1.1)' : undefined,
              }}
            >
              <span style={{
                fontSize: 8,
                fontWeight: 700,
                color: p.pm > maxPM * 0.5 ? '#fff' : 'var(--navy-900)',
                textAlign: 'center',
                lineHeight: 1.2,
                wordBreak: 'break-word',
                fontFamily: 'var(--f-body)',
              }}>
                {p.name.replace(/^Kep\. /, '').replace(/^Kab\. /, '')}
              </span>
              <span style={{
                fontSize: 7.5,
                fontFamily: 'var(--f-mono)',
                fontWeight: 600,
                color: p.pm > maxPM * 0.5 ? 'rgba(255,255,255,0.85)' : 'var(--ink-700)',
              }}>
                {p.pm >= 1_000_000 ? `${(p.pm/1_000_000).toFixed(1)}jt`
                  : p.pm >= 1_000 ? `${(p.pm/1_000).toFixed(0)}rb`
                  : String(p.pm)}
              </span>
            </button>
          );
        })}
      </div>
      {hovered && (() => {
        const p = provArr.find(x => x.name === hovered);
        if (!p) return null;
        return (
          <div style={{
            position: 'absolute', bottom: -60, left: 0,
            background: 'var(--navy-950)', color: '#fff',
            borderRadius: 8, padding: '8px 12px', fontSize: 11,
            boxShadow: 'var(--shadow-pop)', pointerEvents: 'none', zIndex: 10,
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
            <div style={{ display: 'flex', gap: 12, color: 'var(--blue-100)', fontSize: 10 }}>
              <span>PM: <b style={{ color: '#fff', fontFamily: 'var(--f-mono)' }}>{fmt(p.pm)}</b></span>
              <span>Satpen: <b style={{ color: '#fff', fontFamily: 'var(--f-mono)' }}>{fmt(p.s)}</b></span>
              <span>KK: <b style={{ color: '#fff', fontFamily: 'var(--f-mono)' }}>{fmt(p.kk)}</b></span>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
