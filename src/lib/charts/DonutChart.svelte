<script lang="ts">
	import * as d3 from 'd3';
	import { fmtShort, fmtFull } from '$lib/format';

	let {
		data,
		size = 188,
		centerLabel = 'Total'
	}: {
		data: { label: string; value: number; color: string }[];
		size?: number;
		centerLabel?: string;
	} = $props();

	const outerR = $derived(size / 2 - 4);
	const innerR = $derived(outerR * 0.64);
	const total = $derived(data.reduce((s, d) => s + d.value, 0));

	let hovered = $state(-1);

	const pie = d3
		.pie<{ label: string; value: number; color: string }>()
		.value((d) => d.value)
		.sort(null)
		.padAngle(0.03);

	const arcs = $derived(
		pie(data).map((slice, i) => {
			const arcGen = d3
				.arc<d3.PieArcDatum<{ label: string; value: number; color: string }>>()
				.innerRadius(innerR)
				.outerRadius(i === hovered ? outerR + 4 : outerR)
				.cornerRadius(4);
			return { path: arcGen(slice) ?? '', color: slice.data.color, label: slice.data.label, value: slice.data.value };
		})
	);

	const centerNum = $derived(hovered >= 0 ? data[hovered].value : total);
	const centerCap = $derived(hovered >= 0 ? data[hovered].label : centerLabel);
</script>

<div class="donut-root">
	<svg width={size} height={size} role="img" aria-label="Donut chart">
		<g transform={`translate(${size / 2},${size / 2})`}>
			{#each arcs as arc, i (arc.label)}
				<path
					d={arc.path}
					fill={arc.color}
					opacity={hovered === -1 || hovered === i ? 1 : 0.4}
					style="transition: opacity 0.3s var(--ease), d 0.3s var(--ease);"
					onmouseenter={() => (hovered = i)}
					onmouseleave={() => (hovered = -1)}
					role="presentation"
				/>
			{/each}
			<text text-anchor="middle" style="font:700 21px var(--font-mono); fill:var(--ink); font-variant-numeric:tabular-nums;" dy="-2">{fmtShort(centerNum)}</text>
			<text text-anchor="middle" style="font:400 9.5px var(--font-mono); fill:var(--ink-3); letter-spacing:0.08em;" dy="14">{centerCap.toUpperCase()}</text>
		</g>
	</svg>

	<div class="donut-legend">
		{#each data as d, i (d.label)}
			<button
				class="legend-row"
				class:dim={hovered !== -1 && hovered !== i}
				onmouseenter={() => (hovered = i)}
				onmouseleave={() => (hovered = -1)}
			>
				<span class="legend-dot" style:background={d.color}></span>
				<span class="legend-label">{d.label}</span>
				<span class="legend-val num">{fmtFull(d.value)}</span>
				<span class="legend-pct num">{((d.value / total) * 100).toFixed(1)}%</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.donut-root { display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap; }
	.donut-legend { display: flex; flex-direction: column; gap: 0.55rem; flex: 1; min-width: 150px; }
	.legend-row {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		font-size: 0.78125rem;
		color: var(--ink-2);
		background: none;
		border: none;
		padding: 0;
		cursor: default;
		font-family: var(--font-body);
		transition: opacity 0.25s var(--ease);
		text-align: left;
	}
	.legend-row.dim { opacity: 0.4; }
	.legend-dot { width: 9px; height: 9px; border-radius: 3px; flex-shrink: 0; }
	.legend-label { flex: 1; }
	.legend-val { color: var(--ink); font-weight: 500; }
	.legend-pct { color: var(--ink-3); font-size: 0.7rem; min-width: 40px; text-align: right; }
</style>
