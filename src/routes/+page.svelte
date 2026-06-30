<script lang="ts">
	import type { PageData } from './$types';
	import HorizBar from '$lib/charts/HorizBar.svelte';
	import StackedBar from '$lib/charts/StackedBar.svelte';
	import DonutChart from '$lib/charts/DonutChart.svelte';
	import GroupedBar from '$lib/charts/GroupedBar.svelte';
	import { fmtFull } from '$lib/format';

	let { data }: { data: PageData } = $props();

	const JENJANG_COLORS: Record<string, string> = {
		SD: '#2563EB',
		SMP: '#7C3AED',
		SMA: '#DC2626',
		SMK: '#D97706',
		PAUD: '#059669',
		SLB: '#0891B2',
		SKB: '#BE185D',
		PKBM: '#78716C'
	};

	const jenjangBars = $derived(
		data.byJenjang.map((j) => ({ label: j.jenjang, value: j.penerima, color: JENJANG_COLORS[j.jenjang] ?? '#6B7280' }))
	);

	const provinsiBars = $derived(data.topProvinsi.map((p) => ({ label: p.label, value: p.penerima })));

	const genderRows = $derived(
		data.byJenjang.map((j) => ({ label: j.jenjang, laki: j.laki, perempuan: j.perempuan }))
	);

	const sekolahDonut = $derived([
		{ label: 'Negeri', value: data.sekolahSplit.negeri, color: '#2563EB' },
		{ label: 'Swasta', value: data.sekolahSplit.swasta, color: '#F59E0B' }
	]);

	const statItems = $derived([
		{ n: data.totals.penerima, label: 'Penerima Manfaat' },
		{ n: data.totals.satpen, label: 'Satuan Pendidikan' },
		{ n: data.totals.provinsi, label: 'Provinsi' },
		{ n: data.totals.kabkota, label: 'Kab / Kota' }
	]);

	const PROVINCE_COLORS = [
		'#2563EB','#7C3AED','#DC2626','#D97706','#059669',
		'#0891B2','#BE185D','#78716C','#4F46E5','#0F766E',
		'#B45309','#1D4ED8','#C026D3','#15803D','#B91C1C'
	];
</script>

<svelte:head>
	<title>Dashboard MBG 2026</title>
</svelte:head>

<div class="page">
	<!-- HEADER -->
	<header class="site-header">
		<div class="container">
			<div class="header-inner">
				<div>
					<p class="header-eyebrow">Program Makan Bergizi Gratis</p>
					<h1 class="header-title">Dashboard MBG <span>2026</span></h1>
				</div>
				<div class="header-badge">
					<span class="badge-dot"></span>
					Data per Juni 2026
				</div>
			</div>
		</div>
	</header>

	<main>
		<!-- STAT STRIP -->
		<section class="stat-section">
			<div class="container">
				<div class="stat-strip">
					{#each statItems as item, i}
						<div class="stat-item">
							<span class="stat-number">{fmtFull(item.n)}</span>
							<span class="stat-label">{item.label}</span>
						</div>
						{#if i < statItems.length - 1}
							<div class="stat-divider" aria-hidden="true"></div>
						{/if}
					{/each}
				</div>
			</div>
		</section>

		<div class="container">
			<hr class="rule" />

			<!-- PENERIMA PER JENJANG -->
			<section class="chart-section">
				<div class="section-head">
					<p class="section-label">Jenjang Pendidikan</p>
					<h2 class="section-title">Penerima Manfaat <strong>per Jenjang</strong></h2>
				</div>
				<HorizBar data={jenjangBars} barHeight={38} gap={10} marginLeft={72} marginRight={80} />
			</section>

			<hr class="rule" />

			<!-- TOP 15 PROVINSI -->
			<section class="chart-section">
				<div class="section-head">
					<p class="section-label">Sebaran Wilayah</p>
					<h2 class="section-title">15 Provinsi <strong>Teratas</strong></h2>
				</div>
				<HorizBar
					data={provinsiBars}
					colors={PROVINCE_COLORS}
					barHeight={32}
					gap={8}
					marginLeft={200}
					marginRight={80}
				/>
			</section>

			<hr class="rule" />

			<!-- GENDER + SEKOLAH -->
			<section class="chart-section two-col">
				<div>
					<div class="section-head">
						<p class="section-label">Distribusi Gender</p>
						<h2 class="section-title">Laki-laki vs <strong>Perempuan</strong></h2>
					</div>
					<StackedBar
						data={genderRows}
						keys={['laki', 'perempuan']}
						labels={['Laki-laki', 'Perempuan']}
						colors={['#2563EB', '#F43F5E']}
						barHeight={26}
						gap={10}
						marginLeft={72}
						normalized={true}
					/>
				</div>

				<div class="col-side">
					<div class="section-head">
						<p class="section-label">Status Sekolah</p>
						<h2 class="section-title">Negeri vs <strong>Swasta</strong></h2>
					</div>
					<DonutChart data={sekolahDonut} size={240} centerLabel="Satuan Pendidikan" />
				</div>
			</section>

			<hr class="rule" />

			<!-- KONDISI KHUSUS -->
			<section class="chart-section">
				<div class="section-head">
					<p class="section-label">Kondisi Khusus Penerima</p>
					<h2 class="section-title">Alergi, Fobia & Intoleransi <strong>per Provinsi</strong></h2>
				</div>
				<GroupedBar
					data={data.specialByProv}
					keys={['alergi', 'fobia', 'intoleransi']}
					labels={['Alergi', 'Fobia Makanan', 'Intoleransi']}
					colors={['#F59E0B', '#6366F1', '#10B981']}
					subBarHeight={14}
					subGap={4}
					groupGap={18}
					marginLeft={190}
					marginRight={80}
				/>
			</section>

			<hr class="rule" />

			<!-- TOP 15 KABKOTA -->
			<section class="chart-section">
				<div class="section-head">
					<p class="section-label">Kabupaten / Kota</p>
					<h2 class="section-title">15 Kabupaten & Kota <strong>Teratas</strong></h2>
				</div>
				<HorizBar
					data={data.topKabkota}
					color="#7C3AED"
					barHeight={32}
					gap={8}
					marginLeft={180}
					marginRight={80}
				/>
			</section>

			<hr class="rule" />
		</div>
	</main>

	<footer class="site-footer">
		<div class="container">
			<p>Sumber data: MASTER_DATASET_MBG_BI2026 &mdash; Kementerian Pendidikan Dasar dan Menengah RI</p>
		</div>
	</footer>
</div>

<style>
	.page { min-height: 100vh; background: var(--bg); }

	/* Header */
	.site-header { background: #0F172A; padding: 2.5rem 0 2rem; }
	.header-inner {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.header-eyebrow {
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #60A5FA;
		margin-bottom: 0.4rem;
	}
	.header-title {
		font-size: clamp(2rem, 5vw, 3.25rem);
		font-weight: 300;
		color: #F8FAFC;
		line-height: 1.1;
	}
	.header-title span { font-weight: 700; color: #60A5FA; }
	.header-badge {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8125rem;
		color: #94A3B8;
		border: 1px solid #1E293B;
		padding: 0.4rem 0.875rem;
		border-radius: 999px;
		white-space: nowrap;
	}
	.badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #22C55E; }

	/* Stat strip */
	.stat-section { background: white; padding: 3rem 0; border-bottom: 1px solid var(--rule); }
	.stat-strip {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		flex-wrap: wrap;
	}
	.stat-item { display: flex; flex-direction: column; gap: 0.3rem; }
	.stat-number {
		font-size: clamp(1.75rem, 4vw, 2.75rem);
		font-weight: 700;
		color: var(--ink);
		letter-spacing: -0.02em;
		line-height: 1;
	}
	.stat-label {
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-3);
	}
	.stat-divider { width: 1px; height: 2.5rem; background: var(--rule); flex-shrink: 0; }

	/* Sections */
	.chart-section { padding: var(--space-chart) 0; }
	.section-head { margin-bottom: 1.75rem; }

	/* Two-column */
	.two-col {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 4rem;
		align-items: start;
	}
	.col-side { min-width: 300px; }

	/* Footer */
	.site-footer { padding: 2rem 0 3rem; border-top: 1px solid var(--rule); }
	.site-footer p { font-size: 0.75rem; color: var(--ink-4); }

	@media (max-width: 720px) {
		.two-col { grid-template-columns: 1fr; }
		.col-side { min-width: auto; }
		.stat-divider { display: none; }
		.stat-strip { gap: 2rem; }
	}
</style>
