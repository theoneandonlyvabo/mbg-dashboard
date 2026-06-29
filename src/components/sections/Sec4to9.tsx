import React, { useMemo, useState, useRef } from 'react';
import type { MBGRecord } from '../../types';
import { groupBy, aggAll } from '../../utils/aggregation';
import { fmt, fmt1, pct, growth } from '../../utils/format';
import { J_ORDER, J_COLOR, SEQ, TREN } from '../../data/constants';
import { DonutChart } from '../charts/DonutChart';
import { BarList } from '../charts/BarList';
import { SVGLineChart, StackedBarChart } from '../charts/SVGCharts';

// ============================================================
// SEC 4: KONDISI KHUSUS
// ============================================================
export const Sec4KondisiKhusus: React.FC<{ records: MBGRecord[] }> = ({ records }) => {
  const agg = useMemo(() => aggAll(records), [records]);
  const byProv = useMemo(() => groupBy(records, r => r.p), [records]);
  const byJenjang = useMemo(() => groupBy(records, r => r.j), [records]);

  const chipCards = [
    { label: 'Total Kondisi Khusus', value: agg.kk, pct: pct(agg.pm ? agg.kk / agg.pm * 100 : 0), color: '#C8932E', bg: '#FBF1DE' },
    { label: 'Alergi', value: agg.al, pct: pct(agg.kk ? agg.al / agg.kk * 100 : 0), color: '#1E8F6B', bg: '#E1F4ED' },
    { label: 'Fobia', value: agg.fo, pct: pct(agg.kk ? agg.fo / agg.kk * 100 : 0), color: '#C8932E', bg: '#FBF1DE' },
    { label: 'Intoleransi', value: agg.in, pct: pct(agg.kk ? agg.in / agg.kk * 100 : 0), color: '#BF4239', bg: '#FAE7E5' },
  ];

  const provRisk = useMemo(() =>
    Object.entries(byProv)
      .map(([name, a]) => ({ name, kk: a.kk, pm: a.pm, pctKk: a.pm ? a.kk / a.pm : 0 }))
      .filter(p => p.kk > 0)
      .sort((a, b) => b.kk - a.kk)
      .slice(0, 12),
    [byProv]
  );

  const maxKK = provRisk[0]?.kk ?? 1;

  const kkJenjangGroups = useMemo(() =>
    J_ORDER.filter(j => byJenjang[j]?.kk).map(j => ({
      label: j,
      segments: [
        { value: byJenjang[j]?.kn ?? 0, color: '#0E2A52', name: 'Negeri' },
        { value: byJenjang[j]?.ks ?? 0, color: '#8BBDE8', name: 'Swasta' },
      ],
    })),
    [byJenjang]
  );

  // Treemap for kondisi khusus
  const treemapItems = provRisk.slice(0, 16);
  const total = treemapItems.reduce((s, p) => s + p.kk, 0) || 1;

  return (
    <section className="section" id="sec4">
      <div className="sec-head">
        <div className="lt"><span className="sec-num">04</span><h2 className="sec-title">Analisis Kondisi Khusus</h2></div>
        <p className="sec-desc">Pemantauan peserta berkebutuhan khusus — alergi, fobia, intoleransi</p>
      </div>

      <div className="chip-cards" style={{ marginBottom: 18 }}>
        {chipCards.map(c => (
          <div key={c.label} className="chip-card">
            <div className="ci-row">
              <div className="ci-icon" style={{ background: c.bg, color: c.color }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
            </div>
            <div className="ci-val tnum">{fmt(c.value)}</div>
            <div className="ci-lbl">{c.label}</div>
            <div className="ci-pct">{c.pct} dari {c.label === 'Total Kondisi Khusus' ? 'PM' : 'total KK'}</div>
          </div>
        ))}
      </div>

      <div className="grid g-2-31" style={{ marginBottom: 18 }}>
        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-title">Distribusi Kondisi Khusus per Provinsi</p>
              <p className="panel-sub">Treemap — ukuran proporsional terhadap jumlah kondisi khusus</p>
            </div>
          </div>
          <div style={{ position: 'relative', width: '100%', height: 280 }}>
            <SimpleTreemap items={treemapItems.map(p => ({ name: p.name, value: p.kk, total }))} />
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-title">Top Wilayah Risiko Tinggi</p>
              <p className="panel-sub">Provinsi dengan kondisi khusus tertinggi</p>
            </div>
          </div>
          <table className="ranktable">
            <thead><tr><th>Wilayah</th><th className="num">Kondisi Khusus</th><th className="num">% Penerima</th></tr></thead>
            <tbody>
              {provRisk.slice(0, 10).map((p, i) => (
                <tr key={p.name}>
                  <td><span className="rk-badge">{i + 1}</span>{p.name}</td>
                  <td className="num">{fmt(p.kk)}</td>
                  <td className="num">{pct(p.pctKk * 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid g-2-11">
        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-title">Kondisi Khusus: Sekolah Negeri vs Swasta</p>
              <p className="panel-sub">Komposisi sekolah negeri &amp; swasta dalam melayani peserta berkondisi khusus</p>
            </div>
          </div>
          <DonutChart slices={[
            { label: 'Negeri', value: agg.kn, color: 'var(--navy-900)' },
            { label: 'Swasta', value: agg.ks, color: 'var(--blue-300)' },
          ]} />
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-title">Breakdown Kondisi Khusus per Jenjang</p>
              <p className="panel-sub">Jenjang dengan kebutuhan layanan inklusif terbesar</p>
            </div>
          </div>
          <StackedBarChart groups={kkJenjangGroups} height={160} />
          <div className="legend-row">
            <span><span className="legend-dot" style={{ background: '#0E2A52' }} />Negeri</span>
            <span><span className="legend-dot" style={{ background: '#8BBDE8' }} />Swasta</span>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================================
// SEC 5: PENERIMA MANFAAT
// ============================================================
export const Sec5PenerimaManfaat: React.FC<{ records: MBGRecord[] }> = ({ records }) => {
  const byProv = useMemo(() => groupBy(records, r => r.p), [records]);
  const agg = useMemo(() => aggAll(records), [records]);

  const provArr = useMemo(() =>
    Object.entries(byProv)
      .map(([name, a]) => ({ name, pm: a.pm, s: a.s, kk: a.kk, avg: a.s ? a.pm / a.s : 0 }))
      .filter(p => p.pm > 0)
      .sort((a, b) => b.avg - a.avg),
    [byProv]
  );

  const maxAvg = provArr[0]?.avg ?? 1;

  const pmVsKKGroups = useMemo(() =>
    provArr.slice(0, 10).map(p => ({
      label: p.name.replace(/Kab\. |Kota /, '').slice(0, 6),
      segments: [
        { value: p.pm, color: '#1B5FAE', name: 'PM' },
        { value: p.kk, color: '#C8932E', name: 'KK' },
      ],
    })),
    [provArr]
  );

  const coverageItems = useMemo(() =>
    provArr.slice(0, 10).map((p, i) => ({
      rank: i + 1, name: p.name, value: Math.round(p.avg), max: Math.round(maxAvg),
    })),
    [provArr, maxAvg]
  );

  const extraKPIs = [
    { lbl: 'Avg PM/Sekolah', val: fmt1(agg.s ? agg.pm / agg.s : 0) },
    { lbl: 'Ratio L/P', val: fmt1(agg.pr ? agg.l / agg.pr : 0) },
    { lbl: 'KK/PM Ratio', val: pct(agg.pm ? agg.kk / agg.pm * 100 : 0) },
    { lbl: 'Total Sekolah', val: fmt(agg.s) },
  ];

  return (
    <section className="section" id="sec5">
      <div className="sec-head">
        <div className="lt"><span className="sec-num">05</span><h2 className="sec-title">Analisis Penerima Manfaat</h2></div>
        <p className="sec-desc">Eksplorasi distribusi, kecukupan, dan ketimpangan penerima manfaat MBG</p>
      </div>

      <div className="grid g-4" style={{ marginBottom: 18 }}>
        {extraKPIs.map(k => (
          <div key={k.lbl} className="panel" style={{ padding: '14px 16px' }}>
            <div className="kpi-val tnum" style={{ fontSize: 22 }}>{k.val}</div>
            <div className="kpi-lbl" style={{ marginTop: 4 }}>{k.lbl}</div>
          </div>
        ))}
      </div>

      <div className="grid g-2-11" style={{ marginBottom: 18 }}>
        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-title">Distribusi PM vs Kondisi Khusus (Top 10)</p>
              <p className="panel-sub">Apakah penerima manfaat sebanding dengan peserta berkondisi khusus?</p>
            </div>
          </div>
          <StackedBarChart groups={pmVsKKGroups} height={180} />
          <div className="legend-row">
            <span><span className="legend-dot" style={{ background: '#1B5FAE' }} />PM</span>
            <span><span className="legend-dot" style={{ background: '#C8932E' }} />Kondisi Khusus</span>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-title">Coverage Ratio per Provinsi (PM / Satpen)</p>
              <p className="panel-sub">Provinsi dengan beban tertinggi per satuan pendidikan</p>
            </div>
          </div>
          <BarList items={coverageItems} />
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <p className="panel-title">Rata-rata Penerima Manfaat per Sekolah — Ranking 20 Provinsi</p>
            <p className="panel-sub">jumlah_penerima_manfaat ÷ jumlah_satuan_pendidikan — diurutkan dari tertinggi</p>
          </div>
        </div>
        <table className="ranktable">
          <thead>
            <tr>
              <th style={{ width: 36 }}>#</th>
              <th>Provinsi</th>
              <th className="num">Penerima Manfaat</th>
              <th className="num">Satuan Pendidikan</th>
              <th className="num">Avg / Sekolah</th>
              <th className="num">% Nasional</th>
            </tr>
          </thead>
          <tbody>
            {provArr.slice(0, 20).map((p, i) => (
              <tr key={p.name}>
                <td><span className="rk-badge">{i + 1}</span></td>
                <td>{p.name}</td>
                <td className="num">{fmt(p.pm)}</td>
                <td className="num">{fmt(p.s)}</td>
                <td className="num">{fmt1(p.avg)}</td>
                <td className="num">{pct(agg.pm ? p.pm / agg.pm * 100 : 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

// ============================================================
// SEC 6: ANALISIS SEKOLAH
// ============================================================
export const Sec6Sekolah: React.FC<{ records: MBGRecord[] }> = ({ records }) => {
  const agg = useMemo(() => aggAll(records), [records]);
  const byProv = useMemo(() => groupBy(records, r => r.p), [records]);
  const byJenjang = useMemo(() => groupBy(records, r => r.j), [records]);

  const satpenByProv = useMemo(() =>
    Object.entries(byProv)
      .map(([name, a]) => ({ name, s: a.s, sn: a.sn, ss: a.ss }))
      .filter(p => p.s > 0)
      .sort((a, b) => b.s - a.s),
    [byProv]
  );
  const maxS = satpenByProv[0]?.s ?? 1;

  const nsJenjangGroups = useMemo(() =>
    J_ORDER.filter(j => byJenjang[j]?.s).map(j => ({
      label: j,
      segments: [
        { value: byJenjang[j]?.sn ?? 0, color: '#0E2A52', name: 'Negeri' },
        { value: byJenjang[j]?.ss ?? 0, color: '#8BBDE8', name: 'Swasta' },
      ],
    })),
    [byJenjang]
  );

  const swastaRatioItems = useMemo(() =>
    satpenByProv
      .map(p => ({ ...p, swastaRatio: p.s ? p.ss / p.s : 0 }))
      .sort((a, b) => b.swastaRatio - a.swastaRatio)
      .slice(0, 10)
      .map((p, i) => ({
        rank: i + 1, name: p.name, value: Math.round(p.swastaRatio * 100), max: 100,
        color: 'var(--amber-500)',
      })),
    [satpenByProv]
  );

  const satpenBarGroups = satpenByProv.slice(0, 15).map(p => ({
    label: p.name.replace(/^Kab\. |^Kota /, '').slice(0, 7),
    segments: [
      { value: p.sn, color: '#0E2A52', name: 'Negeri' },
      { value: p.ss, color: '#8BBDE8', name: 'Swasta' },
    ],
  }));

  return (
    <section className="section" id="sec6">
      <div className="sec-head">
        <div className="lt"><span className="sec-num">06</span><h2 className="sec-title">Analisis Sekolah</h2></div>
        <p className="sec-desc">Sebaran satuan pendidikan penyelenggara MBG berdasarkan status dan wilayah</p>
      </div>

      <div className="grid g-2-31" style={{ marginBottom: 18 }}>
        <div className="panel">
          <div className="panel-head">
            <div><p className="panel-title">Negeri vs Swasta</p><p className="panel-sub">Komposisi status satuan pendidikan nasional</p></div>
          </div>
          <DonutChart slices={[
            { label: 'Negeri', value: agg.sn, color: 'var(--navy-900)' },
            { label: 'Swasta', value: agg.ss, color: 'var(--blue-300)' },
          ]} />
        </div>
        <div className="panel">
          <div className="panel-head">
            <div><p className="panel-title">Top 15 Provinsi — Jumlah Satuan Pendidikan</p><p className="panel-sub">Provinsi dengan satpen MBG terbanyak</p></div>
          </div>
          <StackedBarChart groups={satpenBarGroups} height={180} />
        </div>
      </div>

      <div className="grid g-2-11">
        <div className="panel">
          <div className="panel-head">
            <div><p className="panel-title">Negeri vs Swasta per Jenjang</p><p className="panel-sub">Komposisi status kepemilikan pada tiap jenjang pendidikan</p></div>
          </div>
          <StackedBarChart groups={nsJenjangGroups} height={160} />
          <div className="legend-row">
            <span><span className="legend-dot" style={{ background: '#0E2A52' }} />Negeri</span>
            <span><span className="legend-dot" style={{ background: '#8BBDE8' }} />Swasta</span>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div><p className="panel-title">Wilayah dengan Ketimpangan Negeri/Swasta</p><p className="panel-sub">Provinsi dengan dominasi swasta tertinggi (risiko akses)</p></div>
          </div>
          <BarList items={swastaRatioItems} />
          <div className="legend-row" style={{ marginTop: 8 }}>
            <span style={{ fontSize: 10.5, color: 'var(--ink-400)' }}>Nilai = % satpen swasta dari total</span>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================================
// SEC 7: ANALISIS TREN
// ============================================================
export const Sec7Tren: React.FC = () => {
  const tren = TREN.tren;
  const trenJenjang = TREN.tren_jenjang;

  const pmPoints = tren.map((t, i) => ({
    x: i, y: t.pm, label: t.label.replace(' 2026', ''), value: t.pm,
  }));

  const satpenPoints = tren.map((t, i) => ({
    x: i, y: t.s, label: t.label.replace(' 2026', ''), value: t.s,
  }));

  const kkPoints = tren.map((t, i) => ({
    x: i, y: t.kk, label: t.label.replace(' 2026', ''), value: t.kk,
  }));

  const jenjangGroups = J_ORDER
    .filter(j => Object.values(trenJenjang).some(period => period[j]))
    .slice(0, 5)
    .map((j, ji) => ({
      label: j,
      segments: tren.map((t) => ({
        value: trenJenjang[t.label]?.[j] ?? 0,
        color: J_COLOR[j] ?? '#8BBDE8',
        name: j,
      })),
    }));

  const kpiCards = tren.map((t, i) => {
    const prev = i > 0 ? tren[i - 1] : null;
    const growthVal = prev ? growth(prev.pm, t.pm) : null;
    return { t, growthVal };
  });

  return (
    <section className="section" id="sec7">
      <div className="sec-head">
        <div className="lt"><span className="sec-num">07</span><h2 className="sec-title">Analisis Tren</h2></div>
        <p className="sec-desc">Perkembangan rollout program MBG dari April → Mei → Juni 2026 berdasarkan snapshot data_pull</p>
      </div>

      <div className="tren-kpi-grid" style={{ marginBottom: 18 }}>
        {kpiCards.map(({ t, growthVal }) => (
          <div key={t.label} className="tren-kpi-card">
            <div className="tk-period">{t.label}</div>
            <div className="tk-val tnum">{t.pm >= 1_000_000 ? `${(t.pm/1_000_000).toFixed(2)}jt` : fmt(t.pm)}</div>
            <div className="tk-lbl">Penerima Manfaat</div>
            {growthVal !== null && (
              <div className={`tk-growth ${growthVal >= 0 ? 'up' : 'dn'}`}>
                {growthVal >= 0 ? '▲' : '▼'} {Math.abs(growthVal).toFixed(1)}%
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid g-2-11" style={{ marginBottom: 18 }}>
        <div className="panel">
          <div className="panel-head">
            <div><p className="panel-title">Pertumbuhan Penerima Manfaat per Periode</p><p className="panel-sub">Area chart akumulasi PM berdasarkan snapshot date_pull</p></div>
          </div>
          <SVGLineChart data={pmPoints} color="#1B5FAE" fillColor="rgba(27,95,174,0.12)" height={160} />
        </div>
        <div className="panel">
          <div className="panel-head">
            <div><p className="panel-title">Pertumbuhan Satuan Pendidikan per Periode</p><p className="panel-sub">Ekspansi cakupan sekolah penyelenggara MBG</p></div>
          </div>
          <SVGLineChart data={satpenPoints} color="#1E8F6B" fillColor="rgba(30,143,107,0.12)" height={160} />
        </div>
      </div>

      <div className="grid g-2-11" style={{ marginBottom: 18 }}>
        <div className="panel">
          <div className="panel-head">
            <div><p className="panel-title">Tren Penerima Manfaat per Jenjang</p><p className="panel-sub">Evolusi kontribusi tiap jenjang lintas periode snapshot</p></div>
          </div>
          <StackedBarChart
            groups={tren.map((t, ti) => ({
              label: t.label.replace(' 2026', ''),
              segments: J_ORDER.filter(j => trenJenjang[t.label]?.[j]).map(j => ({
                value: trenJenjang[t.label]?.[j] ?? 0,
                color: J_COLOR[j] ?? '#8BBDE8',
                name: j,
              })),
            }))}
            height={180}
          />
        </div>
        <div className="panel">
          <div className="panel-head">
            <div><p className="panel-title">Pertumbuhan Kondisi Khusus</p><p className="panel-sub">Tren kasus kondisi khusus seiring ekspansi data</p></div>
          </div>
          <SVGLineChart data={kkPoints} color="#C8932E" fillColor="rgba(200,147,46,0.12)" height={160} />
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div><p className="panel-title">Tabel Ringkasan Tren per Periode Snapshot</p><p className="panel-sub">Perbandingan metrik kunci lintas 3 periode pelaporan</p></div>
        </div>
        <table className="ranktable">
          <thead>
            <tr>
              <th>Periode</th>
              <th className="num">Penerima Manfaat</th>
              <th className="num">Satpen</th>
              <th className="num">Laki-laki</th>
              <th className="num">Perempuan</th>
              <th className="num">Kondisi Khusus</th>
              <th className="num">Kecamatan</th>
              <th className="num">Provinsi</th>
              <th className="num">Coverage Ratio</th>
            </tr>
          </thead>
          <tbody>
            {tren.map(t => (
              <tr key={t.label}>
                <td><b>{t.label}</b></td>
                <td className="num">{fmt(t.pm)}</td>
                <td className="num">{fmt(t.s)}</td>
                <td className="num">{fmt(t.l)}</td>
                <td className="num">{fmt(t.pr)}</td>
                <td className="num">{fmt(t.kk)}</td>
                <td className="num">{fmt(t.kec)}</td>
                <td className="num">{t.prov}</td>
                <td className="num">{fmt1(t.s ? t.pm / t.s : 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

// ============================================================
// SEC 8: DEEP DIVE WILAYAH
// ============================================================
interface TreeNode {
  id: string;
  type: 'prov' | 'kab' | 'kec';
  label: string;
  pm: number;
  s: number;
  l: number;
  pr: number;
  kk: number;
  sn: number;
  ss: number;
  open: boolean;
}

export const Sec8DeepDive: React.FC<{ records: MBGRecord[] }> = ({ records }) => {
  const [treeState, setTreeState] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');

  const byPKC = useMemo(() => {
    const map: Record<string, Record<string, Record<string, { pm: number; s: number; l: number; pr: number; kk: number; sn: number; ss: number }>>> = {};
    for (const r of records) {
      if (!map[r.p]) map[r.p] = {};
      if (!map[r.p][r.k]) map[r.p][r.k] = {};
      if (!map[r.p][r.k][r.c]) map[r.p][r.k][r.c] = { pm: 0, s: 0, l: 0, pr: 0, kk: 0, sn: 0, ss: 0 };
      const a = map[r.p][r.k][r.c];
      a.pm += r.pm; a.s += r.s; a.l += r.l; a.pr += r.pr;
      a.kk += r.kk; a.sn += r.sn; a.ss += r.ss;
    }
    return map;
  }, [records]);

  // Build prov level
  const byP = useMemo(() => {
    const m: Record<string, { pm: number; s: number; l: number; pr: number; kk: number; sn: number; ss: number }> = {};
    for (const [p, kabs] of Object.entries(byPKC)) {
      if (!m[p]) m[p] = { pm: 0, s: 0, l: 0, pr: 0, kk: 0, sn: 0, ss: 0 };
      for (const kabs2 of Object.values(kabs))
        for (const kec of Object.values(kabs2)) {
          const a = m[p];
          a.pm += kec.pm; a.s += kec.s; a.l += kec.l; a.pr += kec.pr;
          a.kk += kec.kk; a.sn += kec.sn; a.ss += kec.ss;
        }
    }
    return m;
  }, [byPKC]);

  const byPK = useMemo(() => {
    const m: Record<string, Record<string, { pm: number; s: number; l: number; pr: number; kk: number; sn: number; ss: number }>> = {};
    for (const [p, kabs] of Object.entries(byPKC)) {
      if (!m[p]) m[p] = {};
      for (const [k, kecs] of Object.entries(kabs)) {
        if (!m[p][k]) m[p][k] = { pm: 0, s: 0, l: 0, pr: 0, kk: 0, sn: 0, ss: 0 };
        for (const kec of Object.values(kecs)) {
          const a = m[p][k];
          a.pm += kec.pm; a.s += kec.s; a.l += kec.l; a.pr += kec.pr;
          a.kk += kec.kk; a.sn += kec.sn; a.ss += kec.ss;
        }
      }
    }
    return m;
  }, [byPKC]);

  const rows = useMemo(() => {
    const result: TreeNode[] = [];
    const provList = Object.keys(byP).filter(p => byP[p].pm > 0).sort((a, b) => byP[b].pm - byP[a].pm);
    for (const p of provList) {
      const pid = `p||${p}`;
      const pOpen = !!treeState[pid];
      result.push({ id: pid, type: 'prov', label: p, ...byP[p], open: pOpen });
      if (pOpen && byPK[p]) {
        for (const k of Object.keys(byPK[p]).sort((a, b) => byPK[p][b].pm - byPK[p][a].pm)) {
          const kid = `${pid}||${k}`;
          const kOpen = !!treeState[kid];
          result.push({ id: kid, type: 'kab', label: k, ...byPK[p][k], open: kOpen });
          if (kOpen && byPKC[p]?.[k]) {
            for (const c of Object.keys(byPKC[p][k]).sort((a, b) => byPKC[p][k][b].pm - byPKC[p][k][a].pm)) {
              result.push({ id: `${kid}||${c}`, type: 'kec', label: c, ...byPKC[p][k][c], open: false });
            }
          }
        }
      }
    }
    return result;
  }, [byP, byPK, byPKC, treeState]);

  const filteredRows = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(r => r.label.toLowerCase().includes(q));
  }, [rows, search]);

  const toggle = (id: string) => setTreeState(s => ({ ...s, [id]: !s[id] }));

  return (
    <section className="section" id="sec8">
      <div className="sec-head">
        <div className="lt"><span className="sec-num">08</span><h2 className="sec-title">Deep Dive Wilayah</h2></div>
        <p className="sec-desc">Drill-down interaktif Provinsi → Kabupaten/Kota → Kecamatan</p>
      </div>
      <div className="panel">
        <div className="tree-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Cari provinsi, kabupaten/kota, atau kecamatan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="panel-tag">{Object.keys(byP).filter(p => byP[p].pm > 0).length} provinsi</span>
        </div>
        <div className="tree-scroll">
          <table className="tree-table">
            <thead>
              <tr>
                <th>Wilayah</th>
                <th>Penerima Manfaat</th>
                <th>Satpen</th>
                <th>Laki-laki</th>
                <th>Perempuan</th>
                <th>Kondisi Khusus</th>
                <th>Negeri</th>
                <th>Swasta</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map(row => {
                const hasChildren = row.type !== 'kec';
                return (
                  <tr
                    key={row.id}
                    className={`tree-row lvl-${row.type}`}
                    onClick={() => hasChildren && toggle(row.id)}
                  >
                    <td>
                      <div className="tree-label">
                        {hasChildren ? (
                          <span className={`tree-caret${row.open ? ' open' : ''}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14">
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                          </span>
                        ) : (
                          <span className="tree-caret leaf">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14">
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                          </span>
                        )}
                        <span>{row.label}</span>
                      </div>
                    </td>
                    <td>{fmt(row.pm)}</td>
                    <td>{fmt(row.s)}</td>
                    <td>{fmt(row.l)}</td>
                    <td>{fmt(row.pr)}</td>
                    <td>{fmt(row.kk)}</td>
                    <td>{fmt(row.sn)}</td>
                    <td>{fmt(row.ss)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

// ============================================================
// SEC 9: INSIGHT ENGINE
// ============================================================
export const Sec9InsightEngine: React.FC<{ records: MBGRecord[] }> = ({ records }) => {
  const agg = useMemo(() => aggAll(records), [records]);
  const byProv = useMemo(() => groupBy(records, r => r.p), [records]);
  const byJenjang = useMemo(() => groupBy(records, r => r.j), [records]);

  const provArr = useMemo(() =>
    Object.entries(byProv)
      .map(([name, a]) => ({ name, ...a }))
      .filter(p => p.pm > 0)
      .sort((a, b) => b.pm - a.pm),
    [byProv]
  );

  const natPM = agg.pm || 1;
  const top1 = provArr[0] ?? { name: 'N/A', pm: 0, s: 0 };
  const topKKPct = [...provArr].sort((a, b) => (b.pm ? b.kk / b.pm : 0) - (a.pm ? a.kk / a.pm : 0))[0] ?? top1;
  const topJKK = J_ORDER.map(j => ({ j, kk: byJenjang[j]?.kk ?? 0 })).sort((a, b) => b.kk - a.kk)[0] ?? { j: 'N/A', kk: 0 };
  const bot5 = provArr.slice(-5).reverse();
  const genderGap = agg.pr ? agg.l / agg.pr : 1;

  const tren = TREN.tren;

  const insights = [
    {
      n: '1', cls: '',
      t: 'Provinsi Penerima Manfaat Terbesar',
      x: `${top1.name} memimpin dengan ${fmt(top1.pm)} jiwa, kontribusi ${pct(top1.pm / natPM * 100)} dari total nasional. Satuan pendidikannya: ${fmt(top1.s)} sekolah.`,
    },
    {
      n: '2', cls: '',
      t: 'Distribusi PM vs Kondisi Khusus',
      x: `${topKKPct.name} memiliki rasio kondisi khusus/PM tertinggi: ${pct(topKKPct.pm ? topKKPct.kk / topKKPct.pm * 100 : 0)}. Ini mengindikasikan perlunya layanan inklusif yang lebih kuat di wilayah ini.`,
    },
    {
      n: '3', cls: '',
      t: 'Jenjang dengan Kebutuhan Inklusif Terbesar',
      x: `Jenjang ${topJKK.j} mencatat kondisi khusus terbanyak: ${fmt(topJKK.kk)} kasus. Intervensi layanan inklusif perlu diprioritaskan pada jenjang ini.`,
    },
    {
      n: '4', cls: '',
      t: 'Komposisi Negeri vs Swasta untuk Kondisi Khusus',
      x: `Sekolah negeri menangani sekitar ${pct(agg.kk ? agg.kn / agg.kk * 100 : 0)} peserta berkondisi khusus, swasta ${pct(agg.kk ? agg.ks / agg.kk * 100 : 0)}. Dominasi ${agg.kn > agg.ks ? 'negeri' : 'swasta'} mengindikasikan perlunya distribusi layanan yang lebih merata.`,
    },
    {
      n: '5', cls: Math.abs(genderGap - 1) > 0.1 ? 'priority' : '',
      t: 'Ketimpangan Gender',
      x: `Rasio laki-laki/perempuan = ${fmt1(genderGap)} (${genderGap > 1.05 ? 'laki-laki lebih dominan' : genderGap < 0.95 ? 'perempuan lebih dominan' : 'distribusi seimbang'}). Total: ${fmt(agg.l)} L vs ${fmt(agg.pr)} P.`,
    },
    {
      n: '6', cls: 'priority',
      t: 'Wilayah Prioritas Intervensi Berikutnya',
      x: `Provinsi dengan PM terendah: ${bot5.map(x => x.name).join(', ')}. Wilayah ini memerlukan perluasan cakupan MBG pada periode berikutnya.`,
    },
    {
      n: '7', cls: '',
      t: 'Tren Rollout Program',
      x: `Data menunjukkan ekspansi signifikan dari ${fmt(tren[0].pm)} PM (${tren[0].label}) ke ${fmt(tren[2].pm)} PM (${tren[2].label}) — pertumbuhan ${pct(growth(tren[0].pm, tren[2].pm) ?? 0)}. Coverage sekolah naik dari ${fmt(tren[0].kec)} ke ${fmt(tren[2].kec)} kecamatan.`,
    },
  ];

  const kecCount = new Set(records.map(r => r.c)).size;
  const pmArr = provArr.map(p => p.pm);
  const mean = pmArr.reduce((s, v) => s + v, 0) / (pmArr.length || 1);
  const cv = mean ? Math.sqrt(pmArr.reduce((s, v) => s + (v - mean) ** 2, 0) / (pmArr.length || 1)) / mean : 0;

  const advCards = [
    { lbl: 'Coverage Index', val: fmt1(agg.s ? agg.pm / agg.s : 0), f: 'PM / Satpen' },
    { lbl: 'Special Needs Ratio', val: pct(agg.pm ? agg.kk / agg.pm * 100 : 0), f: 'KK / PM × 100%' },
    { lbl: 'School Density', val: fmt1(kecCount ? agg.s / kecCount : 0), f: 'Satpen / Kecamatan' },
    { lbl: 'Gender Balance Score', val: fmt1(agg.pr ? agg.l / agg.pr : 0), f: 'Laki / Perempuan (1.0=seimbang)' },
    { lbl: 'Inequality Index (CV)', val: pct(cv * 100), f: 'Std / Mean antar provinsi' },
  ];

  return (
    <section className="section" id="sec9">
      <div className="sec-head">
        <div className="lt"><span className="sec-num">09</span><h2 className="sec-title">Insight Engine &amp; Advanced Analytics</h2></div>
        <p className="sec-desc">Auto-generated insight &amp; indikator komposit untuk pengambilan keputusan strategis</p>
      </div>

      <div className="insight-grid" style={{ marginBottom: 18 }}>
        {insights.map(ins => (
          <div key={ins.n} className={`insight-card ${ins.cls}`}>
            <div className="insight-num">{ins.n}</div>
            <div className="insight-body">
              <div className="ititle">{ins.t}</div>
              <div className="itext">{ins.x}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="adv-grid">
        {advCards.map(c => (
          <div key={c.lbl} className="adv-card">
            <div className="a-lbl">{c.lbl}</div>
            <div className="a-val tnum">{c.val}</div>
            <div className="a-formula">{c.f}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ============================================================
// TREEMAP HELPER (for Sec4)
// ============================================================
interface TreemapItem { name: string; value: number; total: number; }

function SimpleTreemap({ items }: { items: TreemapItem[] }) {
  if (!items.length) return null;
  const SEQ_COLORS = ['#194B8E','#2566AC','#2E78C7','#4F92D6','#7DAEE3','#A9CBF0','#CFE2F8','#C8932E','#E3AF57','#EECC8B'];

  let x = 0; let y = 0;
  const W = 100; const H = 100;
  const totalV = items.reduce((s, i) => s + i.value, 0) || 1;

  // Simple squarify-lite: row by row
  const cells: { x: number; y: number; w: number; h: number; item: TreemapItem; color: string }[] = [];
  let remaining = [...items].sort((a, b) => b.value - a.value);
  let curY = 0;
  const rowH = H / Math.ceil(Math.sqrt(remaining.length));

  remaining.forEach((item, i) => {
    const w = (item.value / totalV) * W * (H / rowH);
    const startX = cells.filter(c => Math.abs(c.y - (Math.floor(i / Math.round(W / rowH)) * rowH)) < 1).reduce((s, c) => s + c.w, 0);
    const rowIdx = Math.floor(i / Math.round(W / rowH));
    cells.push({
      x: (i % Math.round(W / rowH)) * rowH,
      y: rowIdx * rowH,
      w: rowH,
      h: rowH,
      item,
      color: SEQ_COLORS[i % SEQ_COLORS.length],
    });
  });

  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="none">
      {cells.map((c, i) => (
        <g key={c.item.name}>
          <rect x={c.x + 0.5} y={c.y + 0.5} width={c.w - 1} height={c.h - 1}
            fill={c.color} rx="1" />
          {c.w > 12 && c.h > 8 && (
            <text x={c.x + c.w / 2} y={c.y + c.h / 2} textAnchor="middle"
              fontSize="3.5" fill="#fff" fontFamily="system-ui" fontWeight="700"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
              {c.item.name.slice(0, 8)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
