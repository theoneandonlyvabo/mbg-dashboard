import React from 'react';
import type { FilterState } from '../../types';
import { LATEST_UPDATE, J_ORDER } from '../../data/constants';
import { RECORDS } from '../../data/records';
import { fmt } from '../../utils/format';

interface TopbarProps {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilter: () => void;
  allProvs: string[];
  availableKabs: string[];
  availableKecs: string[];
}

export const Topbar: React.FC<TopbarProps> = ({
  filter, setFilter, resetFilter,
  allProvs, availableKabs, availableKecs,
}) => {
  const handleProvChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(f => ({ ...f, prov: e.target.value, kab: 'ALL', kec: 'ALL' }));
  };
  const handleKabChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(f => ({ ...f, kab: e.target.value, kec: 'ALL' }));
  };
  const handleKecChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(f => ({ ...f, kec: e.target.value }));
  };
  const handleJenjangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(f => ({ ...f, jenjang: e.target.value }));
  };
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(f => ({ ...f, status: e.target.value }));
  };

  const chips: { key: keyof FilterState; label: string }[] = [];
  if (filter.prov !== 'ALL') chips.push({ key: 'prov', label: `Provinsi: ${filter.prov}` });
  if (filter.kab !== 'ALL') chips.push({ key: 'kab', label: `Kab/Kota: ${filter.kab}` });
  if (filter.kec !== 'ALL') chips.push({ key: 'kec', label: `Kecamatan: ${filter.kec}` });
  if (filter.jenjang !== 'ALL') chips.push({ key: 'jenjang', label: `Jenjang: ${filter.jenjang}` });
  if (filter.status !== 'ALL') chips.push({ key: 'status', label: `Status: ${filter.status === 'N' ? 'Negeri' : 'Swasta'}` });

  const removeChip = (key: keyof FilterState) => {
    if (key === 'prov') setFilter(f => ({ ...f, prov: 'ALL', kab: 'ALL', kec: 'ALL' }));
    else if (key === 'kab') setFilter(f => ({ ...f, kab: 'ALL', kec: 'ALL' }));
    else if (key === 'kec') setFilter(f => ({ ...f, kec: 'ALL' }));
    else setFilter(f => ({ ...f, [key]: 'ALL' }));
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="gov-line">
          <span className="dot" />
          KEMENTERIAN KOORDINATOR BIDANG PEMBANGUNAN MANUSIA &amp; KEBUDAYAAN
          <span className="sp" />
          <div className="live-pill">
            <span className="ld" />
            DATA TERKONEKSI — MONITORING MBG 2026
          </div>
        </div>

        <div className="head-row">
          <div className="head-id">
            <div className="mark">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M13 3L22 7.5V13.5C22 18.5 18 22.2 13 23.5C8 22.2 4 18.5 4 13.5V7.5L13 3Z"
                  stroke="white" strokeWidth="1.6" fill="rgba(255,255,255,0.08)" />
                <path d="M8.5 13.2L11.3 16L17.5 9.6" stroke="white" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="eyebrow">Program Makan Bergizi Gratis · Business Intelligence Dashboard</p>
              <h1 className="title">Executive Monitoring Dashboard MBG 2026</h1>
              <p className="subtitle">
                Monitoring Penerima Manfaat &amp; Satuan Pendidikan Nasional — ETL Data Nasional MBG
              </p>
            </div>
          </div>

          <div className="update-card">
            <div className="lbl">TANGGAL UPDATE DATA</div>
            <div className="val tnum">{LATEST_UPDATE}</div>
            <div className="sub tnum">{fmt(RECORDS.length)} baris data (setelah normalisasi)</div>
          </div>
        </div>

        <div className="filterbar">
          <div className="fgroup">
            <label>Tahun</label>
            <select defaultValue="2026" disabled>
              <option value="2026">2026</option>
            </select>
          </div>

          <div className="fgroup">
            <label>Provinsi</label>
            <select value={filter.prov} onChange={handleProvChange}>
              <option value="ALL">Seluruh Provinsi</option>
              {allProvs.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="fgroup">
            <label>Kabupaten / Kota</label>
            <select value={filter.kab} onChange={handleKabChange} disabled={availableKabs.length === 0}>
              <option value="ALL">Seluruh Kab/Kota</option>
              {availableKabs.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          <div className="fgroup">
            <label>Kecamatan</label>
            <select value={filter.kec} onChange={handleKecChange} disabled={availableKecs.length === 0}>
              <option value="ALL">Seluruh Kecamatan</option>
              {availableKecs.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="fgroup">
            <label>Jenjang Pendidikan</label>
            <select value={filter.jenjang} onChange={handleJenjangChange}>
              <option value="ALL">Seluruh Jenjang</option>
              {J_ORDER.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>

          <div className="fgroup">
            <label>Status Sekolah</label>
            <select value={filter.status} onChange={handleStatusChange}>
              <option value="ALL">Negeri &amp; Swasta</option>
              <option value="N">Negeri Saja</option>
              <option value="S">Swasta Saja</option>
            </select>
          </div>

          <div className="fbtns">
            <button className="btn btn-reset" onClick={resetFilter}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" />
              </svg>
              Reset
            </button>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="active-filters">
            {chips.map(ch => (
              <div key={ch.key} className="afchip">
                <b>{ch.label}</b>
                <span className="x" onClick={() => removeChip(ch.key)}>&times;</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
