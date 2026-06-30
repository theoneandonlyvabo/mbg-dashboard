<script lang="ts">
	import * as d3 from 'd3';
	import { fmtShort, fmtFull } from '$lib/format';
	import Tooltip from './Tooltip.svelte';

	let { base, target }: { base: number; target: number } = $props();

	let months = $state(30);
	let containerWidth = $state(640);
	const H = 268;
	const PAD = { t: 16, r: 16, b: 30, l: 46 };

	const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
	function dateLabel(m: number) {
		const d = new Date(2026, 5 + m, 1); // start Jun 2026
		return `${MONTH_NAMES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
	}

	// S-curve adoption (smootherstep) from base → target
	function smoother(x: number) {
		const t = Math.min(Math.max(x, 0), 1);
		return t * t * t * (t * (6 * t - 15) + 10);
	}
	function project(m: number) {
		return base + (target - base) * smoother(m / months);
	}

	const points = $derived(
		Array.from({ length: months + 1 }, (_, m) => {
			const v = project(m);
			const spread = 0.13 * (m / months);
			return { m, v, hi: Math.min(v * (1 + spread), target), lo: Math.max(v * (1 - spread), base) };
		})
	);

	// model self-confidence shrinks as the projection horizon lengthens
	const confidence = $derived(Math.round(Math.max(72, 96 - (months - 18) * 0.7)));

	const plotW = $derived(Math.max(containerWidth - PAD.l - PAD.r, 1));
	const x = $derived(d3.scaleLinear().domain([0, months]).range([PAD.l, PAD.l + plotW]));
	const y = $derived(d3.scaleLinear().domain([0, target * 1.04]).range([H - PAD.b, PAD.t]));

	// ponytail: explicit reads of x/y/points so Svelte 5 tracks them as deps (closures don't register signals)
	const linePath = $derived.by(() => {
		const xFn = x, yFn = y, pts = points;
		return d3.line<{ m: number; v: number }>()
			.x((d) => xFn(d.m)).y((d) => yFn(d.v)).curve(d3.curveMonotoneX)(pts) ?? '';
	});
	const bandPath = $derived.by(() => {
		const xFn = x, yFn = y, pts = points;
		return d3.area<{ m: number; hi: number; lo: number }>()
			.x((d) => xFn(d.m)).y0((d) => yFn(d.lo)).y1((d) => yFn(d.hi)).curve(d3.curveMonotoneX)(pts) ?? '';
	});

	const yTicks = $derived(y.ticks(4));
	const xTickStep = $derived(months <= 24 ? 6 : 12);

	// readouts
	const cov12 = $derived((project(Math.min(12, months)) / target) * 100);
	const reachLabel = $derived(dateLabel(months));

	let tt = $state({ x: 0, y: 0, visible: false, title: '', rows: [] as { label: string; value: string; color?: string }[] });
	let guideX = $state(-1);

	function hover(e: MouseEvent) {
		const wrap = (e.currentTarget as Element).closest('.chart-wrap')!.getBoundingClientRect();
		const mx = e.clientX - wrap.left;
		const m = Math.round(Math.min(Math.max(x.invert(mx), 0), months));
		const v = project(m);
		guideX = x(m);
		tt = {
			x: x(m),
			y: y(v),
			visible: true,
			title: dateLabel(m),
			rows: [
				{ label: 'Proyeksi', value: fmtFull(Math.round(v)), color: 'var(--c1)' },
				{ label: 'Cakupan', value: `${((v / target) * 100).toFixed(1)}%` }
			]
		};
	}
	function leave() {
		tt = { ...tt, visible: false };
		guideX = -1;
	}
</script>

<div class="chart-wrap" bind:clientWidth={containerWidth}>
	<svg width={containerWidth} height={H} role="img" aria-label="Proyeksi pertumbuhan penerima">
		<defs>
			<linearGradient id="fc-fill" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="var(--c1)" stop-opacity="0.28" />
				<stop offset="100%" stop-color="var(--c1)" stop-opacity="0.01" />
			</linearGradient>
		</defs>

		<!-- y grid + labels -->
		{#each yTicks as tk}
			<line x1={PAD.l} x2={PAD.l + plotW} y1={y(tk)} y2={y(tk)} stroke="var(--rule)" stroke-dasharray="2 3" />
			<text x={PAD.l - 8} y={y(tk)} text-anchor="end" dominant-baseline="middle" class="axis-tick">{fmtShort(tk)}</text>
		{/each}

		<!-- target line -->
		<line x1={PAD.l} x2={PAD.l + plotW} y1={y(target)} y2={y(target)} stroke="var(--c5)" stroke-width="1" stroke-dasharray="4 3" opacity="0.8" />
		<text x={PAD.l + plotW} y={y(target) - 5} text-anchor="end" style="font:600 9.5px var(--font-mono); fill:var(--c5);">TARGET {fmtShort(target)}</text>

		<!-- confidence band + projection line -->
		<path d={bandPath} fill="url(#fc-fill)" />
		<path d={linePath} fill="none" stroke="var(--c1)" stroke-width="2.4" stroke-dasharray="2 4" stroke-linecap="round" />

		<!-- actual anchor (now) -->
		<circle cx={x(0)} cy={y(base)} r="5" fill="var(--c1)" stroke="#fff" stroke-width="1.5" />
		<text x={x(0) + 8} y={y(base) - 8} style="font:600 9.5px var(--font-mono); fill:var(--ink-2);">KINI {fmtShort(base)}</text>

		<!-- x labels -->
		{#each Array.from({ length: Math.floor(months / xTickStep) + 1 }, (_, i) => i * xTickStep) as m}
			<text x={x(m)} y={H - PAD.b + 16} text-anchor="middle" class="axis-tick">{dateLabel(m)}</text>
		{/each}

		<!-- guide -->
		{#if guideX >= 0}
			<line x1={guideX} x2={guideX} y1={PAD.t} y2={H - PAD.b} stroke="var(--ink-3)" stroke-width="1" opacity="0.4" />
		{/if}

		<!-- hover capture -->
		<rect x={PAD.l} y={PAD.t} width={plotW} height={H - PAD.t - PAD.b} fill="transparent" onmousemove={hover} onmouseleave={leave} role="presentation" />
	</svg>

	<div class="fc-meta">
		<div class="fc-conf">
			<div class="fc-conf-top">
				<span>Keyakinan model</span>
				<span class="num">{confidence}%</span>
			</div>
			<div class="fc-conf-bar"><span style:width="{confidence}%"></span></div>
		</div>
		<div class="fc-model">
			<span class="fc-tag">Model: Logistic S-curve</span>
			<span class="fc-tag">Engine: Claude Opus 4.8</span>
		</div>
	</div>

	<div class="fc-control">
		<div class="fc-readouts">
			<span class="fc-pill">Cakupan 12 bln: <strong class="num">{cov12.toFixed(1)}%</strong></span>
			<span class="fc-pill">Target penuh: <strong>{reachLabel}</strong></span>
		</div>
		<label class="fc-slider">
			<span>Horizon proyeksi</span>
			<input type="range" min="18" max="48" step="6" bind:value={months} />
			<span class="num">{months} bln</span>
		</label>
	</div>

	<Tooltip x={tt.x} y={tt.y} visible={tt.visible} title={tt.title} rows={tt.rows} />
</div>

<style>
	.fc-meta { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-top: 0.85rem; padding-top: 0.85rem; border-top: 1px solid var(--rule); }
	.fc-conf { display: flex; flex-direction: column; gap: 0.3rem; min-width: 180px; flex: 1; }
	.fc-conf-top { display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--ink-2); }
	.fc-conf-top .num { color: var(--accent-strong); font-weight: 700; }
	.fc-conf-bar { height: 6px; background: var(--track); border-radius: 4px; overflow: hidden; }
	.fc-conf-bar span { display: block; height: 100%; background: linear-gradient(90deg, var(--c4), var(--accent)); transition: width 0.4s var(--ease); }
	.fc-model { display: flex; gap: 0.4rem; flex-wrap: wrap; }
	.fc-tag { font-family: var(--font-mono); font-size: 0.62rem; color: var(--ink-2); background: var(--surface-2); border: 1px solid var(--rule); border-radius: 999px; padding: 0.25rem 0.55rem; }

	.fc-control { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-top: 0.75rem; }
	.fc-readouts { display: flex; gap: 0.5rem; flex-wrap: wrap; }
	.fc-pill {
		font-size: 0.7rem;
		color: var(--ink-2);
		background: var(--surface-2);
		border: 1px solid var(--rule);
		border-radius: 999px;
		padding: 0.3rem 0.65rem;
	}
	.fc-pill strong { color: var(--ink); }
	.fc-slider { display: flex; align-items: center; gap: 0.6rem; font-size: 0.7rem; color: var(--ink-3); }
	.fc-slider input[type='range'] { accent-color: var(--accent); width: 130px; cursor: pointer; }
	.fc-slider .num { color: var(--ink); min-width: 48px; }
</style>
