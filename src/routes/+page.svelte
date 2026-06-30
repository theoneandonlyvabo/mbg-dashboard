<script lang="ts">
	import type { PageData } from './$types';
	import HorizBar from '$lib/charts/HorizBar.svelte';
	import StackedBar from '$lib/charts/StackedBar.svelte';
	import DonutChart from '$lib/charts/DonutChart.svelte';
	import GroupedBar from '$lib/charts/GroupedBar.svelte';
	import CountUp from '$lib/CountUp.svelte';
	import { fmtShort } from '$lib/format';

	let { data }: { data: PageData } = $props();

	let selected = $state('ALL');

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
		<div class="brand">
			<div class="brand-mark">MBG</div>
			<div class="brand-text">
				<span class="brand-title">Pusat Data <strong>Makan Bergizi Gratis</strong></span>
				<span class="brand-sub">Business Intelligence · Tahun Anggaran 2026</span>
			</div>
		</div>

		<nav class="filters" aria-label="Filter jenjang">
			<button class="pill" class:active={selected === 'ALL'} onclick={() => (selected = 'ALL')}>Semua</button>
			{#each data.jenjangOrder as j (j)}
				<button class="pill" class:active={selected === j} onclick={() => (selected = j)}>{j}</button>
			{/each}
		</nav>

		<div class="live">
			<span class="live-dot"></span>
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
	</div>

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
		background: rgba(244, 246, 249, 0.82);
		backdrop-filter: blur(14px);
		border-bottom: 1px solid var(--rule);
	}
	.topbar-inner {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		height: 64px;
		justify-content: space-between;
	}
	.brand { display: flex; align-items: center; gap: 0.7rem; flex-shrink: 0; }
	.brand-mark {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.95rem;
		letter-spacing: -0.02em;
		color: #fff;
		background: var(--accent);
		padding: 0.3rem 0.5rem;
		border-radius: 7px;
		box-shadow: 0 6px 16px -6px var(--accent-glow);
	}
	.brand-text { display: flex; flex-direction: column; line-height: 1.25; }
	.brand-title { font-size: 0.875rem; color: var(--ink-2); font-weight: 400; }
	.brand-title strong { color: var(--ink); font-weight: 600; }
	.brand-sub { font-family: var(--font-mono); font-size: 0.625rem; color: var(--ink-3); letter-spacing: 0.04em; }

	.filters { display: flex; gap: 0.3rem; overflow-x: auto; padding: 0.25rem; scrollbar-width: none; }
	.filters::-webkit-scrollbar { display: none; }
	.pill {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 500;
		letter-spacing: 0.03em;
		color: var(--ink-2);
		background: var(--surface-2);
		border: 1px solid var(--rule);
		border-radius: 999px;
		padding: 0.38rem 0.8rem;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.22s var(--ease);
	}
	.pill:hover { color: var(--ink); border-color: var(--rule-strong); }
	.pill.active {
		color: #fff;
		background: var(--accent);
		border-color: var(--accent);
		box-shadow: 0 6px 16px -6px var(--accent-glow);
	}

	.live { display: flex; align-items: center; gap: 0.45rem; font-size: 0.75rem; color: var(--ink-2); flex-shrink: 0; }
	.live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); animation: pulse 2s infinite; }
	@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }

	/* ── Bento grid ── */
	.bento {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		gap: var(--gap);
		grid-auto-flow: row dense;
		padding: var(--gap) 0 1.5rem;
	}
	.span5 { grid-column: span 5; }
	.span7 { grid-column: span 7; }
	.span12 { grid-column: span 12; }
	.row2 { grid-row: span 2; }
	.kpi { grid-column: span 3; }

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
		.span7, .span5 { grid-column: span 12; }
		.row2 { grid-row: span 1; }
	}
	@media (max-width: 560px) {
		.kpi { grid-column: span 12; }
		.brand-text { display: none; }
		.topbar-inner { height: 56px; gap: 0.6rem; }
	}
</style>
