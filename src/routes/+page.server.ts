import csv from '../../static/data.csv?raw';
import type { PageServerLoad } from './$types';
import type { View, JenjangDist, ProvinsiBar, SpecialRow, SimpleBar, Totals, GeoStat, Insight } from '$lib/types';
import { normProv, displayProv } from '$lib/geo';

/** Real MBG program target: full national rollout by 2029 (~82.9 juta penerima). */
const NATIONAL_TARGET = 82_900_000;

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

	// Per-province aggregate keyed by canonical name (for the choropleth)
	const gMap = new Map<string, GeoStat>();
	const kabSet = new Map<string, Set<string>>();
	for (const r of rows) {
		const key = normProv(r.provinsi);
		const g = gMap.get(key) ?? {
			key,
			name: displayProv(r.provinsi),
			penerima: 0, laki: 0, perempuan: 0, alergi: 0, fobia: 0, intoleransi: 0, satpen: 0, kabkota: 0
		};
		g.penerima += r.penerima; g.laki += r.laki; g.perempuan += r.perempuan;
		g.alergi += r.alergi; g.fobia += r.fobia; g.intoleransi += r.intoleransi; g.satpen += r.satpen;
		gMap.set(key, g);
		if (!kabSet.has(key)) kabSet.set(key, new Set());
		kabSet.get(key)!.add(r.kabkota);
	}
	for (const [key, set] of kabSet) gMap.get(key)!.kabkota = set.size;
	const geoStats: Record<string, GeoStat> = Object.fromEntries(gMap);

	// ── Auto-generated insights (derived from real figures) ──
	const t = views.ALL.totals;
	const gAll = views.ALL.gender;
	const totalGender = gAll.laki + gAll.perempuan || 1;
	const provSorted = [...gMap.values()].sort((a, b) => b.penerima - a.penerima);
	const top3Share = (provSorted.slice(0, 3).reduce((s, p) => s + p.penerima, 0) / t.penerima) * 100;
	const sdShare = ((views.SD?.totals.penerima ?? 0) / t.penerima) * 100;
	const special = gMap.size
		? [...gMap.values()].reduce((s, p) => s + p.alergi + p.fobia + p.intoleransi, 0)
		: 0;
	const specialPer1k = (special / t.penerima) * 1000;
	const coverage = (t.penerima / NATIONAL_TARGET) * 100;
	const lowest = provSorted[provSorted.length - 1];

	const insights: Insight[] = [
		{
			tone: 'accent',
			label: 'Cakupan Nasional',
			value: `${coverage.toFixed(1)}%`,
			detail: `Dari target rollout penuh 82,9 juta penerima (2029). Realisasi saat ini ${new Intl.NumberFormat('id-ID').format(t.penerima)} jiwa.`,
			method: 'Rasio agregat',
			confidence: 99
		},
		{
			tone: 'warn',
			label: 'Konsentrasi Geografis',
			value: `${top3Share.toFixed(0)}%`,
			detail: `${provSorted.slice(0, 3).map((p) => p.name).join(', ')} menyerap mayoritas penerima — sinyal ketimpangan distribusi antarwilayah.`,
			method: 'Indeks konsentrasi',
			confidence: 95
		},
		{
			tone: 'neutral',
			label: 'Dominasi Jenjang',
			value: `${sdShare.toFixed(0)}%`,
			detail: `Sekolah Dasar mendominasi penerima manfaat, mengarahkan prioritas logistik pada gizi anak usia 6–12 tahun.`,
			method: 'Distribusi proporsi',
			confidence: 97
		},
		{
			tone: 'neutral',
			label: 'Keseimbangan Gender',
			value: `${((gAll.laki / totalGender) * 100).toFixed(1)} : ${((gAll.perempuan / totalGender) * 100).toFixed(1)}`,
			detail: `Rasio laki-laki dibanding perempuan nyaris seimbang secara nasional.`,
			method: 'Rasio agregat',
			confidence: 99
		},
		{
			tone: 'warn',
			label: 'Kebutuhan Diet Khusus',
			value: `${specialPer1k.toFixed(1)}‰`,
			detail: `Per 1.000 penerima memiliki alergi, fobia, atau intoleransi makanan — perlu menu alternatif pada perencanaan dapur.`,
			method: 'Prevalensi per-1.000',
			confidence: 91
		},
		{
			tone: 'accent',
			label: 'Prioritas Ekspansi',
			value: lowest?.name ?? '—',
			detail: `Provinsi dengan realisasi terendah (${new Intl.NumberFormat('id-ID').format(lowest?.penerima ?? 0)} jiwa) — kandidat utama akselerasi tahap berikutnya.`,
			method: 'Ranking + gap analysis',
			confidence: 88
		}
	];

	return {
		views,
		jenjangDist,
		jenjangOrder: JENJANG_ORDER.filter((j) => jMap.has(j)),
		geoStats,
		insights,
		forecast: { base: t.penerima, target: NATIONAL_TARGET }
	};
};
