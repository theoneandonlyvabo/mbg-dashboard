import React, { useMemo } from 'react';
import type { MBGRecord } from '../../types';
import { aggAll, groupBy } from '../../utils/aggregation';
import { fmt, pct, growth } from '../../utils/format';
import { TREN } from '../../data/constants';
import { DonutChart } from '../charts/DonutChart';

interface Sec1Props { records: MBGRecord[]; }

export const Sec1Executive: React.FC<Sec1Props> = ({ records }) => {
  const agg = useMemo(() => aggAll(records), [records]);
  const prev = TREN.tren[1]; // Mei 2026 as prev snapshot

  const kpiCards = useMemo(() => [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      label: 'Total Penerima Manfaat',
      value: fmt(agg.pm),
      delta: growth(prev.pm, agg.pm),
      foot: `L: ${fmt(agg.l)} · P: ${fmt(agg.pr)}`,
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      label: 'Satuan Pendidikan',
      value: fmt(agg.s),
      delta: null,
      foot: `Negeri: ${fmt(agg.sn)} · Swasta: ${fmt(agg.ss)}`,
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      label: 'Kondisi Khusus',
      value: fmt(agg.kk),
      delta: null,
      deltaClass: 'warn',
      foot: `${pct(agg.pm ? agg.kk / agg.pm * 100 : 0)} dari total PM`,
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
      label: 'Coverage Ratio',
      value: fmt(agg.s ? Math.round(agg.pm / agg.s) : 0),
      delta: null,
      deltaClass: 'pos',
      foot: 'PM per satuan pendidikan',
    },
  ], [agg, prev]);

  const nsSlices = useMemo(() => [
    { label: 'Negeri', value: agg.sn, color: 'var(--navy-900)' },
    { label: 'Swasta', value: agg.ss, color: 'var(--blue-300)' },
  ], [agg]);

  const genderSlices = useMemo(() => [
    { label: 'Laki-laki', value: agg.l, color: 'var(--blue-700)' },
    { label: 'Perempuan', value: agg.pr, color: 'var(--blue-300)' },
  ], [agg]);

  return (
    <section className="section" id="sec1">
      <div className="sec-head">
        <div className="lt">
          <span className="sec-num">01</span>
          <h2 className="sec-title">Executive Summary</h2>
        </div>
        <p className="sec-desc">Ringkasan capaian program MBG secara nasional berdasarkan filter aktif</p>
      </div>

      <div className="kpi-grid">
        {kpiCards.map((k, i) => {
          const deltaClass = k.deltaClass ?? (k.delta !== null && k.delta !== undefined && k.delta > 0 ? 'pos' : 'neu');
          const deltaLabel = k.delta !== null && k.delta !== undefined
            ? `${k.delta > 0 ? '+' : ''}${k.delta.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
            : null;
          return (
            <div key={i} className="kpi-card">
              <div className="kpi-top">
                <div className="kpi-icon">{k.icon}</div>
                {deltaLabel && (
                  <span className={`kpi-delta ${deltaClass}`}>{deltaLabel}</span>
                )}
              </div>
              <div className="kpi-val tnum">{k.value}</div>
              <div className="kpi-lbl">{k.label}</div>
              <div className="kpi-foot">{k.foot}</div>
            </div>
          );
        })}
      </div>

      <div className="grid g-2-11" style={{ marginTop: 18 }}>
        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-title">Komposisi Sekolah Negeri vs Swasta</p>
              <p className="panel-sub">Distribusi satuan pendidikan berdasarkan status kepemilikan</p>
            </div>
          </div>
          <DonutChart slices={nsSlices} />
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-title">Distribusi Gender Penerima Manfaat</p>
              <p className="panel-sub">Proporsi laki-laki vs perempuan secara nasional</p>
            </div>
          </div>
          <DonutChart slices={genderSlices} />
        </div>
      </div>
    </section>
  );
};
