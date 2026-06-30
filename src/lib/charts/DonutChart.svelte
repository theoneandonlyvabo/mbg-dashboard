<script lang="ts">
	import * as d3 from 'd3';
	import { fmtShort, fmtFull } from '$lib/format';

	let {
		data,
		size = 260,
		centerLabel = 'Total'
	}: {
		data: { label: string; value: number; color: string }[];
		size?: number;
		centerLabel?: string;
	} = $props();

	const outerR = $derived(size / 2 - 8);
	const innerR = $derived(outerR * 0.6);
	const cx = $derived(size / 2);
	const cy = $derived(size / 2);

	const total = $derived(data.reduce((s, d) => s + d.value, 0));

	const pie = d3
		.pie<{ label: string; value: number; color: string }>()
		.value((d) => d.value)
		.sort(null)
		.padAngle(0.025);

	const arcs = $derived(
		pie(data).map((slice) => {
			const arcGen = d3
				.arc<d3.PieArcDatum<{ label: string; value: number; color: string }>>()
				.innerRadius(innerR)
				.outerRadius(outerR)
				.cornerRadius(3);
			return {
				path: arcGen(slice) ?? '',
				color: slice.data.color,
				label: slice.data.label,
				value: slice.data.value
			};
		})
	);
</script>

<div class="donut-root">
	<svg width={size} height={size} role="img" aria-label="Donut chart">
		<g transform={`translate(${cx},${cy})`}>
			{#each arcs as arc}
				<path d={arc.path} fill={arc.color} />
			{/each}
			<text
				text-anchor="middle"
				style="font: 700 18px 'Inter', sans-serif; fill: #0F172A;"
				dy="-4"
			>{fmtShort(total)}</text>
			<text
				text-anchor="middle"
				style="font: 400 11px 'Inter', sans-serif; fill: #64748B;"
				dy="14"
			>{centerLabel}</text>
		</g>
	</svg>

	<div class="donut-legend">
		{#each data as d}
			<div class="legend-row">
				<span class="legend-dot" style:background={d.color}></span>
				<span class="legend-label">{d.label}</span>
				<span class="legend-val">{fmtFull(d.value)}</span>
				<span class="legend-pct">({((d.value / total) * 100).toFixed(1)}%)</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.donut-root {
		display: flex;
		align-items: center;
		gap: 2rem;
		flex-wrap: wrap;
	}
	.donut-legend {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.legend-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8125rem;
		color: #334155;
	}
	.legend-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.legend-label {
		flex: 1;
		min-width: 8rem;
	}
	.legend-val {
		font-weight: 600;
		color: #0F172A;
	}
	.legend-pct {
		color: #94A3B8;
		font-size: 0.75rem;
	}
</style>
