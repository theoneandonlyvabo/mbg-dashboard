<script lang="ts">
	import type { PageData } from './$types';
	import HorizBar from '$lib/charts/HorizBar.svelte';
	import StackedBar from '$lib/charts/StackedBar.svelte';
	import DonutChart from '$lib/charts/DonutChart.svelte';
	import GroupedBar from '$lib/charts/GroupedBar.svelte';
	import CountUp from '$lib/CountUp.svelte';
	import ChoroplethMap from '$lib/charts/ChoroplethMap.svelte';
	import ForecastChart from '$lib/charts/ForecastChart.svelte';
	import TechStack from '$lib/TechStack.svelte';
	import { fmtShort, fmtFull } from '$lib/format';
	import { untrack } from 'svelte';

	let { data }: { data: PageData } = $props();

	let selected = $state('ALL');

	// Map / province drill-down — geoStats is static server data
	const geoRanked = untrack(() => Object.values(data.geoStats).sort((a, b) => b.penerima - a.penerima));
	let selectedProv = $state(geoRanked[0]?.key ?? '');
	const activeStat = $derived(data.geoStats[selectedProv] ?? geoRanked[0]);
	const activeRank = $derived(geoRanked.findIndex((s) => s.key === activeStat?.key) + 1);
	const activeGenderPct = $derived.by(() => {
		const tot = (activeStat?.laki ?? 0) + (activeStat?.perempuan ?? 0) || 1;
		return ((activeStat?.laki ?? 0) / tot) * 100;
	});

	const view = $derived(data.views[selected] ?? data.views.ALL);

	const JENJANG_COLORS: Record<string, string> = {
		SD: 'var(--c1)', SMP: 'var(--c2)', SMA: 'var(--c3)', SMK: 'var(--c4)',
		PAUD: 'var(--c6)', SLB: 'var(--c5)', SKB: 'var(--c7)', PKBM: 'var(--c8)'
	};
	const PROVINCE_COLORS = [
		'#059669', '#2563EB', '#7C3AED', '#D97706', '#E11D48',
		'#0D9488', '#EA580C', '#4F46E5', '#059669', '#2563EB',
		'#7C3AED', '#D97706', '#E11D48', '#0D9488', '#EA580C'
	];

	const provinceBars = $derived(view.provinces.map((p) => ({ label: p.label, value: p.value })));
	const genderRows = $derived([
		{ label: selected === 'ALL' ? 'Total Nasional' : selected, laki: view.gender.laki, perempuan: view.gender.perempuan }
	]);
	const sekolahDonut = $derived([
		{ label: 'Negeri', value: view.sekolah.negeri, color: 'var(--c2)' },
		{ label: 'Swasta', value: view.sekolah.swasta, color: 'var(--c4)' }
	]);

	const maxJenjang = $derived(Math.max(...data.jenjangDist.map((j) => j.penerima)));

	const kpis = $derived([
		{ n: view.totals.penerima, label: 'Penerima Manfaat', unit: 'jiwa' },
		{ n: view.totals.satpen, label: 'Satuan Pendidikan', unit: 'unit' },
		{ n: view.totals.provinsi, label: 'Provinsi', unit: 'wilayah' },
		{ n: view.totals.kabkota, label: 'Kabupaten / Kota', unit: 'wilayah' }
	]);

	const filterLabel = $derived(selected === 'ALL' ? 'Seluruh Jenjang' : `Jenjang ${selected}`);
</script>

<svelte:head>
	<title>Dashboard MBG 2026 — Pusat Data</title>
</svelte:head>

<!-- ── STICKY TOP BAR ── -->
<header class="topbar">
	<div class="container topbar-inner">
		<a class="brand" href="/" aria-label="Beranda Dashboard MBG">
			<span class="brand-mark" aria-hidden="true">
				<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M3 12h18a9 9 0 0 1-18 0Z" />
					<path d="M3 16.5h18" />
					<path d="M9 7c-.7.7-.7 1.8 0 2.5" />
					<path d="M13 6c-.7.7-.7 1.8 0 2.5" />
				</svg>
			</span>
			<span class="brand-text">
				<span class="brand-title">Pusat Data <strong>Makan Bergizi Gratis</strong></span>
				<span class="brand-sub">Business Intelligence · TA 2026</span>
			</span>
		</a>

		<nav class="filters" aria-label="Filter jenjang">
			<span class="filters-label">Jenjang</span>
			<div class="seg">
				<button class="pill" class:active={selected === 'ALL'} onclick={() => (selected = 'ALL')}>Semua</button>
				{#each data.jenjangOrder as j (j)}
					<button class="pill" class:active={selected === j} onclick={() => (selected = j)}>{j}</button>
				{/each}
			</div>
		</nav>

		<div class="live">
			<span class="live-dot"></span>
			<span class="live-label">Live</span>
			<span class="live-sep"></span>
			<span class="num">Jun 2026</span>
		</div>
	</div>
</header>

<main class="container">
	<div class="bento">
		<!-- KPI TILES -->
		{#each kpis as kpi (kpi.label)}
			<div class="tile kpi">
				<span class="tile-eyebrow">{kpi.unit}</span>
				<div class="kpi-num"><CountUp value={kpi.n} /></div>
				<span class="kpi-label">{kpi.label}</span>
			</div>
		{/each}

		<!-- CHOROPLETH MAP -->
		<div class="tile span8">
			<div class="tile-head">
				<div>
					<span class="tile-eyebrow">Peta Sebaran</span>
					<h2 class="tile-title">Heatmap Penerima Nasional</h2>
				</div>
				<span class="tag">Klik provinsi untuk detail</span>
			</div>
			<div class="tile-chart">
				<ChoroplethMap stats={data.geoStats} bind:selectedKey={selectedProv} />
			</div>
		</div>

		<!-- PROVINCE DETAIL -->
		<div class="tile span4 detail">
			<span class="tile-eyebrow">Provinsi terpilih · #{activeRank}</span>
			<h2 class="detail-name">{activeStat?.name ?? '—'}</h2>
			<div class="detail-big num"><CountUp value={activeStat?.penerima ?? 0} /></div>
			<span class="detail-cap">penerima manfaat</span>

			<div class="detail-gender">
				<div class="dg-track">
					<span class="dg-l" style:width="{activeGenderPct}%"></span>
				</div>
				<div class="dg-labels">
					<span>L · {fmtShort(activeStat?.laki ?? 0)}</span>
					<span>P · {fmtShort(activeStat?.perempuan ?? 0)}</span>
				</div>
			</div>

			<div class="detail-grid">
				<div><span class="dgi-v num">{fmtShort(activeStat?.satpen ?? 0)}</span><span class="dgi-l">Satpen</span></div>
				<div><span class="dgi-v num">{activeStat?.kabkota ?? 0}</span><span class="dgi-l">Kab/Kota</span></div>
				<div><span class="dgi-v num">{fmtFull(activeStat?.alergi ?? 0)}</span><span class="dgi-l">Alergi</span></div>
				<div><span class="dgi-v num">{fmtFull((activeStat?.fobia ?? 0) + (activeStat?.intoleransi ?? 0))}</span><span class="dgi-l">Fobia + Intol.</span></div>
			</div>
		</div>

		<!-- PROVINCE RANKING (tall) -->
		<div class="tile span7 row2">
			<div class="tile-head">
				<div>
					<span class="tile-eyebrow">Ranking Wilayah</span>
					<h2 class="tile-title">15 Provinsi Penerima Terbesar</h2>
				</div>
				<span class="tag">{filterLabel}</span>
			</div>
			<div class="tile-chart">
				<HorizBar data={provinceBars} colors={PROVINCE_COLORS} marginLeft={168} barHeight={20} gap={8} />
			</div>
		</div>

		<!-- GENDER -->
		<div class="tile span5">
			<div class="tile-head">
				<div>
					<span class="tile-eyebrow">Komposisi</span>
					<h2 class="tile-title">Distribusi Gender</h2>
				</div>
			</div>
			<div class="tile-chart">
				<StackedBar data={genderRows} keys={['laki', 'perempuan']} labels={['Laki-laki', 'Perempuan']} colors={['var(--c2)', 'var(--c5)']} barHeight={30} marginLeft={4} />
			</div>
		</div>

		<!-- SEKOLAH DONUT -->
		<div class="tile span5">
			<div class="tile-head">
				<div>
					<span class="tile-eyebrow">Status</span>
					<h2 class="tile-title">Negeri vs Swasta</h2>
				</div>
			</div>
			<div class="tile-chart donut">
				<DonutChart data={sekolahDonut} size={172} centerLabel="Satpen" />
			</div>
		</div>

		<!-- JENJANG DISTRIBUTION (interactive filter mirror) -->
		<div class="tile span5">
			<div class="tile-head">
				<div>
					<span class="tile-eyebrow">Klik untuk memfilter</span>
					<h2 class="tile-title">Penerima per Jenjang</h2>
				</div>
			</div>
			<div class="jenjang-list">
				{#each data.jenjangDist as j (j.jenjang)}
					<button
						class="jrow"
						class:active={selected === j.jenjang}
						onclick={() => (selected = selected === j.jenjang ? 'ALL' : j.jenjang)}
					>
						<span class="jname">{j.jenjang}</span>
						<span class="jbar-track">
							<span class="jbar-fill" style:width="{(j.penerima / maxJenjang) * 100}%" style:background={JENJANG_COLORS[j.jenjang]}></span>
						</span>
						<span class="jval num">{fmtShort(j.penerima)}</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- CONDITIONS -->
		<div class="tile span7">
			<div class="tile-head">
				<div>
					<span class="tile-eyebrow">Kebutuhan Khusus</span>
					<h2 class="tile-title">Alergi · Fobia · Intoleransi</h2>
				</div>
				<span class="tag">Top 10 Provinsi</span>
			</div>
			<div class="tile-chart">
				<GroupedBar data={view.conditions} keys={['alergi', 'fobia', 'intoleransi']} labels={['Alergi', 'Fobia Makanan', 'Intoleransi']} colors={['var(--c4)', 'var(--c8)', 'var(--c6)']} marginLeft={158} />
			</div>
		</div>

		<!-- KABKOTA -->
		<div class="tile span12">
			<div class="tile-head">
				<div>
					<span class="tile-eyebrow">Granular</span>
					<h2 class="tile-title">15 Kabupaten / Kota Penerima Terbesar</h2>
				</div>
				<span class="tag">{filterLabel}</span>
			</div>
			<div class="tile-chart">
				<HorizBar data={view.kabkota} color="var(--c2)" marginLeft={176} barHeight={20} gap={8} />
			</div>
		</div>

		<!-- AI ANALYTICS BAND -->
		<div class="ai-head span12">
			<span class="ai-chip">AI</span>
			<div>
				<h2 class="ai-title">Analitik &amp; Proyeksi Cerdas</h2>
				<p class="ai-sub">Temuan otomatis dari data aktual dan simulasi pertumbuhan menuju target nasional 82,9 juta penerima (2029).</p>
			</div>
			<span class="ai-engine">
				<span class="ai-engine-dot"></span>
				Ditenagai <strong>Claude Opus 4.8</strong>
			</span>
		</div>

		<!-- INSIGHTS -->
		<div class="tile span5">
			<div class="tile-head">
				<div>
					<span class="tile-eyebrow">Temuan Otomatis</span>
					<h2 class="tile-title">Insight Utama</h2>
				</div>
			</div>
			<div class="insights">
				{#each data.insights as ins (ins.label)}
					<div class="ins ins-{ins.tone}">
						<div class="ins-top">
							<span class="ins-label">{ins.label}</span>
							<span class="ins-value num">{ins.value}</span>
						</div>
						<p class="ins-detail">{ins.detail}</p>
						<div class="ins-foot">
							<span class="ins-method">{ins.method}</span>
							<span class="ins-conf">
								<span class="ins-conf-bar"><span style:width="{ins.confidence}%"></span></span>
								Keyakinan {ins.confidence}%
							</span>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- FORECAST -->
		<div class="tile span7">
			<div class="tile-head">
				<div>
					<span class="tile-eyebrow">Simulasi Pertumbuhan</span>
					<h2 class="tile-title">Proyeksi Cakupan Nasional</h2>
				</div>
				<span class="tag">Model adopsi S-curve</span>
			</div>
			<div class="tile-chart">
				<ForecastChart base={data.forecast.base} target={data.forecast.target} />
			</div>
		</div>
	</div>

	<TechStack />

	<footer class="foot">
		<span>Sumber: <span class="num">MASTER_DATASET_MBG_BI2026</span></span>
		<span>Kementerian Pendidikan Dasar &amp; Menengah RI</span>
	</footer>
</main>

<style>
	/* ── Top bar ── */
	.topbar {
		position: sticky;
		top: 0;
		z-index: 20;
		background: rgba(247, 249, 251, 0.72);
		backdrop-filter: blur(18px) saturate(140%);
		border-bottom: 1px solid var(--rule);
		box-shadow: 0 1px 0 rgba(255, 255, 255, 0.6) inset, 0 8px 24px -22px rgba(15, 23, 42, 0.4);
	}
	.topbar-inner {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		height: 70px;
		justify-content: space-between;
	}
	.brand { display: flex; align-items: center; gap: 0.7rem; flex-shrink: 0; text-decoration: none; }
	.brand-mark {
		display: grid;
		place-items: center;
		width: 38px;
		height: 38px;
		border-radius: 11px;
		background: linear-gradient(140deg, var(--accent) 0%, #0D9488 100%);
		box-shadow: 0 8px 18px -8px var(--accent-glow), inset 0 1px 0 rgba(255, 255, 255, 0.35);
		transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease);
	}
	.brand:hover .brand-mark { transform: translateY(-1px) rotate(-3deg); box-shadow: 0 12px 24px -8px var(--accent-glow); }
	.brand-text { display: flex; flex-direction: column; line-height: 1.25; }
	.brand-title { font-size: 0.9rem; color: var(--ink-2); font-weight: 400; letter-spacing: -0.01em; }
	.brand-title strong { color: var(--ink); font-weight: 700; }
	.brand-sub { font-family: var(--font-mono); font-size: 0.625rem; color: var(--ink-3); letter-spacing: 0.04em; margin-top: 1px; }

	.filters { display: flex; align-items: center; gap: 0.6rem; min-width: 0; }
	.filters-label {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		font-weight: 500;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-3);
		flex-shrink: 0;
	}
	.seg {
		display: flex;
		gap: 0.15rem;
		padding: 0.25rem;
		background: rgba(15, 23, 42, 0.04);
		border: 1px solid var(--rule);
		border-radius: 999px;
		overflow-x: auto;
		scrollbar-width: none;
	}
	.seg::-webkit-scrollbar { display: none; }
	.pill {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 500;
		letter-spacing: 0.03em;
		color: var(--ink-2);
		background: transparent;
		border: none;
		border-radius: 999px;
		padding: 0.34rem 0.78rem;
		cursor: pointer;
		white-space: nowrap;
		transition: color 0.2s var(--ease), background 0.2s var(--ease), box-shadow 0.2s var(--ease);
	}
	.pill:hover { color: var(--ink); background: rgba(15, 23, 42, 0.05); }
	.pill.active {
		color: #fff;
		background: linear-gradient(140deg, var(--accent), #0D9488);
		box-shadow: 0 5px 12px -5px var(--accent-glow);
	}

	.live {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: var(--ink-2);
		flex-shrink: 0;
		background: var(--surface);
		border: 1px solid var(--rule);
		border-radius: 999px;
		padding: 0.4rem 0.8rem;
		box-shadow: 0 6px 16px -14px rgba(15, 23, 42, 0.5);
	}
	.live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); animation: pulse 2s infinite; }
	.live-label { font-family: var(--font-mono); font-size: 0.62rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent-strong); }
	.live-sep { width: 1px; height: 12px; background: var(--rule); }
	@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }

	/* ── Bento grid ── */
	.bento {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		gap: var(--gap);
		grid-auto-flow: row dense;
		padding: var(--gap) 0 1.5rem;
	}
	.span4 { grid-column: span 4; }
	.span5 { grid-column: span 5; }
	.span7 { grid-column: span 7; }
	.span8 { grid-column: span 8; }
	.span12 { grid-column: span 12; }
	.row2 { grid-row: span 2; }
	.kpi { grid-column: span 3; }

	/* Province detail */
	.detail { display: flex; flex-direction: column; }
	.detail-name { font-family: var(--font-display); font-weight: 700; font-size: 1.4rem; letter-spacing: -0.02em; color: var(--ink); margin-top: 0.45rem; line-height: 1.1; }
	.detail-big { font-size: 2.1rem; font-weight: 700; color: var(--ink); letter-spacing: -0.03em; margin-top: 0.6rem; line-height: 1; }
	.detail-cap { font-size: 0.72rem; color: var(--ink-3); }
	.detail-gender { margin-top: 1rem; }
	.dg-track { height: 9px; border-radius: 5px; background: var(--c5); overflow: hidden; }
	.dg-l { display: block; height: 100%; background: var(--c2); transition: width 0.6s var(--ease); }
	.dg-labels { display: flex; justify-content: space-between; font-size: 0.68rem; color: var(--ink-2); margin-top: 0.35rem; }
	.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-top: auto; padding-top: 1rem; }
	.detail-grid > div { display: flex; flex-direction: column; gap: 0.1rem; padding: 0.55rem 0.65rem; background: var(--surface-2); border-radius: 9px; }
	.dgi-v { font-size: 1rem; font-weight: 600; color: var(--ink); }
	.dgi-l { font-size: 0.62rem; color: var(--ink-3); text-transform: uppercase; letter-spacing: 0.05em; }

	/* AI band */
	.ai-head {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.5rem 0.25rem 0;
		margin-top: 0.5rem;
	}
	.ai-chip {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.8rem;
		letter-spacing: 0.04em;
		color: #fff;
		background: linear-gradient(135deg, var(--accent), #0D9488);
		padding: 0.45rem 0.65rem;
		border-radius: 9px;
		box-shadow: 0 8px 20px -8px var(--accent-glow);
		flex-shrink: 0;
	}
	.ai-title { font-family: var(--font-display); font-weight: 700; font-size: 1.3rem; letter-spacing: -0.02em; color: var(--ink); line-height: 1.1; }
	.ai-sub { font-size: 0.8rem; color: var(--ink-2); margin-top: 0.2rem; max-width: 60ch; }
	.ai-engine {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.72rem;
		color: var(--ink-2);
		background: var(--surface);
		border: 1px solid var(--rule);
		border-radius: 999px;
		padding: 0.4rem 0.8rem;
		white-space: nowrap;
	}
	.ai-engine strong { color: var(--ink); font-weight: 600; }
	.ai-engine-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }

	/* insight footer */
	.ins-foot { display: flex; align-items: center; justify-content: space-between; gap: 0.6rem; margin-top: 0.5rem; }
	.ins-method { font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.04em; text-transform: uppercase; color: var(--ink-3); background: var(--surface); border: 1px solid var(--rule); border-radius: 999px; padding: 0.18rem 0.5rem; }
	.ins-conf { display: flex; align-items: center; gap: 0.4rem; font-size: 0.62rem; color: var(--ink-3); }
	.ins-conf-bar { width: 42px; height: 5px; background: var(--track); border-radius: 4px; overflow: hidden; }
	.ins-conf-bar span { display: block; height: 100%; background: var(--accent); }

	/* Insights */
	.insights { display: flex; flex-direction: column; gap: 0.55rem; }
	.ins { padding: 0.7rem 0.8rem; border-radius: 10px; background: var(--surface-2); border-left: 3px solid var(--ink-4); }
	.ins-accent { border-left-color: var(--accent); }
	.ins-warn { border-left-color: var(--c4); }
	.ins-neutral { border-left-color: var(--c2); }
	.ins-top { display: flex; align-items: baseline; justify-content: space-between; gap: 0.75rem; }
	.ins-label { font-family: var(--font-mono); font-size: 0.6rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); }
	.ins-value { font-size: 1.15rem; font-weight: 700; color: var(--ink); flex-shrink: 0; }
	.ins-detail { font-size: 0.74rem; color: var(--ink-2); line-height: 1.5; margin-top: 0.25rem; }

	.bento > .tile { animation: rise 0.55s var(--ease) backwards; }
	.bento > .tile:nth-child(1) { animation-delay: 0.02s; }
	.bento > .tile:nth-child(2) { animation-delay: 0.06s; }
	.bento > .tile:nth-child(3) { animation-delay: 0.10s; }
	.bento > .tile:nth-child(4) { animation-delay: 0.14s; }
	.bento > .tile:nth-child(5) { animation-delay: 0.18s; }
	.bento > .tile:nth-child(6) { animation-delay: 0.22s; }
	.bento > .tile:nth-child(7) { animation-delay: 0.26s; }
	.bento > .tile:nth-child(8) { animation-delay: 0.30s; }
	.bento > .tile:nth-child(9) { animation-delay: 0.34s; }
	@keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

	/* KPI */
	.kpi { display: flex; flex-direction: column; gap: 0.15rem; }
	.kpi-num {
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
		font-size: clamp(1.5rem, 2.6vw, 2.25rem);
		font-weight: 600;
		color: var(--ink);
		letter-spacing: -0.03em;
		line-height: 1.1;
		margin-top: 0.5rem;
	}
	.kpi-label { font-size: 0.75rem; color: var(--ink-2); font-weight: 500; }

	/* tile heads */
	.tile-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; margin-bottom: 1rem; }
	.tag {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		color: var(--ink-2);
		background: var(--surface-2);
		border: 1px solid var(--rule);
		border-radius: 999px;
		padding: 0.22rem 0.6rem;
		white-space: nowrap;
		flex-shrink: 0;
	}
	.tile-chart { width: 100%; }
	.tile-chart.donut { display: flex; align-items: center; min-height: 180px; }

	/* jenjang interactive list */
	.jenjang-list { display: flex; flex-direction: column; gap: 0.4rem; }
	.jrow {
		display: grid;
		grid-template-columns: 42px 1fr 52px;
		align-items: center;
		gap: 0.6rem;
		background: none;
		border: 1px solid transparent;
		border-radius: 8px;
		padding: 0.3rem 0.4rem;
		cursor: pointer;
		transition: background 0.2s var(--ease), border-color 0.2s var(--ease);
	}
	.jrow:hover { background: var(--surface-2); }
	.jrow.active { background: var(--surface-2); border-color: var(--rule-strong); }
	.jname { font-family: var(--font-mono); font-size: 0.75rem; font-weight: 500; color: var(--ink); text-align: left; }
	.jbar-track { height: 8px; background: var(--track); border-radius: 5px; overflow: hidden; }
	.jbar-fill { display: block; height: 100%; border-radius: 5px; transition: width 0.6s var(--ease); opacity: 0.9; }
	.jval { font-size: 0.72rem; color: var(--ink-2); text-align: right; }

	/* footer */
	.foot {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding: 1.5rem 0 3rem;
		border-top: 1px solid var(--rule);
		margin-top: 0.5rem;
		font-size: 0.7rem;
		color: var(--ink-3);
	}
	.foot .num { color: var(--ink-2); }

	/* ── Responsive ── */
	@media (max-width: 1080px) {
		.kpi { grid-column: span 6; }
		.span7, .span5, .span8, .span4 { grid-column: span 12; }
		.row2 { grid-row: span 1; }
	}
	@media (max-width: 860px) {
		.filters-label { display: none; }
		.live-label, .live-sep { display: none; }
	}
	@media (max-width: 560px) {
		.kpi { grid-column: span 12; }
		.brand-text { display: none; }
		.topbar-inner { height: 60px; gap: 0.6rem; }
	}
</style>
