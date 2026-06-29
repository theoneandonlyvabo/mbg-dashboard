import React, { useMemo } from 'react';
import type { MBGRecord } from '../../types';
import { groupBy, aggAll } from '../../utils/aggregation';
import { fmt } from '../../utils/format';
import { J_ORDER, J_COLOR } from '../../data/constants';
import { DonutChart } from '../charts/DonutChart';
import { StackedBarChart } from '../charts/SVGCharts';

interface Sec3Props { records: MBGRecord[]; }

export const Sec3Demografi: React.FC<Sec3Props> = ({ records }) => {
  const byJenjang = useMemo(() => groupBy(records, r => r.j), [records]);
  const byProv = useMemo(() => groupBy(records, r => r.p), [records]);

  const jenjangSlices = useMemo(() =>
    J_ORDER
      .filter(j => byJenjang[j]?.pm)
      .map(j => ({
        label: j,
        value: byJenjang[j]?.pm ?? 0,
        color: J_COLOR[j] ?? '#8BBDE8',
      })),
    [byJenjang]
  );

  const stackedGroups = useMemo(() =>
    J_ORDER
      .filter(j => byJenjang[j]?.pm)
      .map(j => ({
        label: j,
        segments: [
          { value: byJenjang[j]?.l ?? 0, color: '#1B5FAE', name: 'Laki-laki' },
          { value: byJenjang[j]?.pr ?? 0, color: '#8BBDE8', name: 'Perempuan' },
        ],
      })),
    [byJenjang]
  );

  const gender100Groups = useMemo(() =>
    J_ORDER
      .filter(j => byJenjang[j]?.pm)
      .map(j => {
        const agg = byJenjang[j]!;
        const total = agg.l + agg.pr;
        return {
          label: j,
          segments: [
            { value: total ? (agg.l / total) * 100 : 50, color: '#1B5FAE', name: 'Laki-laki' },
            { value: total ? (agg.pr / total) * 100 : 50, color: '#8BBDE8', name: 'Perempuan' },
          ],
        };
      }),
    [byJenjang]
  );

  const heatmapProvs = useMemo(() =>
    Object.entries(byProv)
      .map(([name, agg]) => ({ name, l: agg.l, pr: agg.pr, pm: agg.pm }))
      .filter(p => p.pm > 0)
      .sort((a, b) => b.pm - a.pm)
      .slice(0, 20),
    [byProv]
  );

  const maxHeatL = Math.max(...heatmapProvs.map(p => p.l), 1);
  const maxHeatP = Math.max(...heatmapProvs.map(p => p.pr), 1);

  const heatColor = (val: number, max: number, isL: boolean): string => {
    const t = val / max;
    const idx = Math.round(t * 7);
    const SEQ = ['#EAF2FC','#CFE2F8','#A9CBF0','#7DAEE3','#4F8AD1','#2E68B5','#194B8E','#0E3163'];
    return isL
      ? SEQ[idx]
      : ['#F8F1DE','#F4E4BE','#EECC8B','#E3AF57','#CCA040','#B88A2E','#9A7122','#7A5616'][idx];
  };

  return (
    <section className="section" id="sec3">
      <div className="sec-head">
        <div className="lt">
          <span className="sec-num">03</span>
          <h2 className="sec-title">Analisis Demografi</h2>
        </div>
        <p className="sec-desc">Komposisi gender &amp; distribusi jenjang penerima manfaat MBG</p>
      </div>

      <div className="grid g-2-11" style={{ marginBottom: 18 }}>
        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-title">Distribusi per Jenjang Pendidikan</p>
              <p className="panel-sub">Kontribusi tiap jenjang terhadap total PM</p>
            </div>
          </div>
          <DonutChart slices={jenjangSlices} />
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-title">Jenjang vs Gender (Stacked Bar)</p>
              <p className="panel-sub">Laki-laki &amp; perempuan per jenjang</p>
            </div>
          </div>
          <StackedBarChart groups={stackedGroups} height={180} />
          <div className="legend-row">
            <span><span className="legend-dot" style={{ background: '#1B5FAE' }} />Laki-laki</span>
            <span><span className="legend-dot" style={{ background: '#8BBDE8' }} />Perempuan</span>
          </div>
        </div>
      </div>

      <div className="grid g-2-37">
        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-title">100% Gender Composition per Jenjang</p>
              <p className="panel-sub">Ketimpangan gender pada tiap jenjang pendidikan</p>
            </div>
          </div>
          <StackedBarChart groups={gender100Groups} height={180} />
          <div className="legend-row">
            <span><span className="legend-dot" style={{ background: '#1B5FAE' }} />Laki-laki</span>
            <span><span className="legend-dot" style={{ background: '#8BBDE8' }} />Perempuan</span>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-title">Heatmap Gender per Provinsi</p>
              <p className="panel-sub">Intensitas peserta laki-laki &amp; perempuan (top 20)</p>
            </div>
          </div>
          <div className="heat-row head">
            <div>Provinsi</div>
            <div>Laki-laki</div>
            <div>Perempuan</div>
            <div style={{ textAlign: 'right' }}>Total</div>
          </div>
          <div className="heatmap-scroll">
            {heatmapProvs.map(p => (
              <div key={p.name} className="heat-row">
                <div className="heat-name">{p.name}</div>
                <div className="heat-cell" style={{ background: heatColor(p.l, maxHeatL, true) }}>
                  {p.l >= 1000 ? `${(p.l/1000).toFixed(0)}rb` : fmt(p.l)}
                </div>
                <div className="heat-cell" style={{ background: heatColor(p.pr, maxHeatP, false) }}>
                  {p.pr >= 1000 ? `${(p.pr/1000).toFixed(0)}rb` : fmt(p.pr)}
                </div>
                <div className="heat-total">{p.pm >= 1_000_000 ? `${(p.pm/1_000_000).toFixed(1)}jt` : fmt(p.pm)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
