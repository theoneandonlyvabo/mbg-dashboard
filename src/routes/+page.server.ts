import { readFileSync } from 'fs';
import { join } from 'path';
import type { PageServerLoad } from './$types';
import type { View, JenjangDist, ProvinsiBar, SpecialRow, SimpleBar, Totals } from '$lib/types';

interface Row {
	provinsi: string;
	kabkota: string;
	jenjang: string;
	satpen: number;
	laki: number;
	perempuan: number;
	alergi: number;
	fobia: number;
	intoleransi: number;
	penerima: number;
	negeri: number;
	swasta: number;
}

const JENJANG_ORDER = ['SD', 'SMP', 'SMA', 'SMK', 'PAUD', 'SLB', 'SKB', 'PKBM'];

function buildView(rows: Row[]): View {
	const totals: Totals = {
		penerima: rows.reduce((s, r) => s + r.penerima, 0),
		satpen: rows.reduce((s, r) => s + r.satpen, 0),
		provinsi: new Set(rows.map((r) => r.provinsi)).size,
		kabkota: new Set(rows.map((r) => r.kabkota)).size
	};

	const gender = {
		laki: rows.reduce((s, r) => s + r.laki, 0),
		perempuan: rows.reduce((s, r) => s + r.perempuan, 0)
	};
	const sekolah = {
		negeri: rows.reduce((s, r) => s + r.negeri, 0),
		swasta: rows.reduce((s, r) => s + r.swasta, 0)
	};

	// provinces
	const pMap = new Map<string, ProvinsiBar>();
	for (const r of rows) {
		const key = r.provinsi;
		const p = pMap.get(key) ?? { label: r.provinsi.replace('Prov. ', ''), value: 0, laki: 0, perempuan: 0 };
		p.value += r.penerima;
		p.laki += r.laki;
		p.perempuan += r.perempuan;
		pMap.set(key, p);
	}
	const provincesAll = [...pMap.values()].sort((a, b) => b.value - a.value);
	const provinces = provincesAll.slice(0, 15);

	// conditions per province
	const cMap = new Map<string, SpecialRow>();
	for (const r of rows) {
		const key = r.provinsi;
		const c = cMap.get(key) ?? { label: r.provinsi.replace('Prov. ', ''), alergi: 0, fobia: 0, intoleransi: 0 };
		c.alergi = (c.alergi as number) + r.alergi;
		c.fobia = (c.fobia as number) + r.fobia;
		c.intoleransi = (c.intoleransi as number) + r.intoleransi;
		cMap.set(key, c);
	}
	const conditions = [...cMap.values()]
		.sort(
			(a, b) =>
				(b.alergi as number) + (b.fobia as number) + (b.intoleransi as number) -
				((a.alergi as number) + (a.fobia as number) + (a.intoleransi as number))
		)
		.slice(0, 10);

	// kabkota
	const kMap = new Map<string, number>();
	for (const r of rows) kMap.set(r.kabkota, (kMap.get(r.kabkota) ?? 0) + r.penerima);
	const kabkota: SimpleBar[] = [...kMap.entries()]
		.map(([label, value]) => ({ label, value }))
		.sort((a, b) => b.value - a.value)
		.slice(0, 15);

	return { totals, gender, sekolah, provinces, conditions, kabkota };
}

export const load: PageServerLoad = () => {
	const csv = readFileSync(join(process.cwd(), 'static', 'data.csv'), 'utf-8');
	const lines = csv.split('\n').filter(Boolean);

	const rows: Row[] = lines.slice(1).map((line) => {
		const c = line.split(',');
		return {
			provinsi: c[1],
			kabkota: c[2],
			jenjang: c[7],
			satpen: +c[8] || 0,
			laki: +c[10] || 0,
			perempuan: +c[11] || 0,
			alergi: +c[12] || 0,
			fobia: +c[13] || 0,
			intoleransi: +c[14] || 0,
			penerima: +c[15] || 0,
			negeri: +c[17] || 0,
			swasta: +c[18] || 0
		};
	});

	// jenjang distribution (global — drives the filter)
	const jMap = new Map<string, number>();
	for (const r of rows) jMap.set(r.jenjang, (jMap.get(r.jenjang) ?? 0) + r.penerima);
	const jenjangDist: JenjangDist[] = JENJANG_ORDER.filter((j) => jMap.has(j)).map((j) => ({
		jenjang: j,
		penerima: jMap.get(j) ?? 0
	}));

	// Build a view per jenjang + ALL
	const views: Record<string, View> = { ALL: buildView(rows) };
	for (const j of JENJANG_ORDER) {
		const sub = rows.filter((r) => r.jenjang === j);
		if (sub.length) views[j] = buildView(sub);
	}

	return { views, jenjangDist, jenjangOrder: JENJANG_ORDER.filter((j) => jMap.has(j)) };
};
