import { readFileSync } from 'fs';
import { join } from 'path';
import type { PageServerLoad } from './$types';
import type { JenjangRow, ProvinsiRow, SimpleBar, SpecialRow, Totals, SekolahSplit } from '$lib/types';

export const load: PageServerLoad = () => {
	const csv = readFileSync(join(process.cwd(), 'static', 'data.csv'), 'utf-8');
	const lines = csv.split('\n').filter(Boolean);

	type Row = { provinsi: string; kabkota: string; jenjang: string; satpen: number; laki: number; perempuan: number; alergi: number; fobia: number; intoleransi: number; penerima: number; negeri: number; swasta: number };
	const rows: Row[] = lines.slice(1).map((line) => {
		const cols = line.split(',');
		return {
			provinsi: cols[1],
			kabkota: cols[2],
			jenjang: cols[7],
			satpen: +cols[8] || 0,
			laki: +cols[10] || 0,
			perempuan: +cols[11] || 0,
			alergi: +cols[12] || 0,
			fobia: +cols[13] || 0,
			intoleransi: +cols[14] || 0,
			penerima: +cols[15] || 0,
			negeri: +cols[17] || 0,
			swasta: +cols[18] || 0
		};
	});

	// Totals
	const totals: Totals = {
		penerima: rows.reduce((s: number, r: Row) => s + r.penerima, 0),
		satpen: rows.reduce((s: number, r: Row) => s + r.satpen, 0),
		provinsi: new Set(rows.map((r: Row) => r.provinsi)).size,
		kabkota: new Set(rows.map((r: Row) => r.kabkota)).size
	};

	// By jenjang
	const jMap = new Map<string, JenjangRow>();
	for (const r of rows) {
		const j = jMap.get(r.jenjang) ?? {
			jenjang: r.jenjang,
			penerima: 0, laki: 0, perempuan: 0,
			alergi: 0, fobia: 0, intoleransi: 0,
			negeri: 0, swasta: 0
		};
		j.penerima += r.penerima; j.laki += r.laki; j.perempuan += r.perempuan;
		j.alergi += r.alergi; j.fobia += r.fobia; j.intoleransi += r.intoleransi;
		j.negeri += r.negeri; j.swasta += r.swasta;
		jMap.set(r.jenjang, j);
	}
	const byJenjang: JenjangRow[] = [...jMap.values()].sort((a, b) => b.penerima - a.penerima);

	// By provinsi
	const pMap = new Map<string, ProvinsiRow>();
	for (const r of rows) {
		const p = pMap.get(r.provinsi) ?? {
			label: r.provinsi.replace('Prov. ', ''),
			penerima: 0, laki: 0, perempuan: 0,
			alergi: 0, fobia: 0, intoleransi: 0
		};
		p.penerima += r.penerima; p.laki += r.laki; p.perempuan += r.perempuan;
		p.alergi += r.alergi; p.fobia += r.fobia; p.intoleransi += r.intoleransi;
		pMap.set(r.provinsi, p);
	}
	const provSorted = [...pMap.values()].sort((a, b) => b.penerima - a.penerima);
	const topProvinsi: ProvinsiRow[] = provSorted.slice(0, 15);

	// Top kabkota
	const kMap = new Map<string, number>();
	for (const r of rows) kMap.set(r.kabkota, (kMap.get(r.kabkota) ?? 0) + r.penerima);
	const topKabkota: SimpleBar[] = [...kMap.entries()]
		.map(([label, value]) => ({ label, value }))
		.sort((a, b) => b.value - a.value)
		.slice(0, 15);

	// Special conditions — top 10 by sum
	const specialByProv: SpecialRow[] = provSorted
		.map(({ label, alergi, fobia, intoleransi }) => ({ label, alergi, fobia, intoleransi }))
		.sort((a, b) => (b.alergi + b.fobia + b.intoleransi) - (a.alergi + a.fobia + a.intoleransi))
		.slice(0, 10);

	// School type split
	const sekolahSplit: SekolahSplit = {
		negeri: byJenjang.reduce((s, j) => s + j.negeri, 0),
		swasta: byJenjang.reduce((s, j) => s + j.swasta, 0)
	};

	return { totals, byJenjang, topProvinsi, topKabkota, specialByProv, sekolahSplit };
};
