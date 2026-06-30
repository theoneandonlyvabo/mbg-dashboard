<script lang="ts">
	import * as d3 from 'd3';

	let {
		data,
		keys = ['laki', 'perempuan'],
		colors = ['#2563EB', '#F43F5E'],
		labels = ['Laki-laki', 'Perempuan'],
		barHeight = 28,
		gap = 10,
		marginLeft = 80,
		marginRight = 10,
		normalized = true
	}: {
		data: { label: string; [key: string]: number | string }[];
		keys?: string[];
		colors?: string[];
		labels?: string[];
		barHeight?: number;
		gap?: number;
		marginLeft?: number;
		marginRight?: number;
		normalized?: boolean;
	} = $props();

	let containerWidth = $state(700);

	const mt = 4;
	const mb = 36; // space for legend

	const svgHeight = $derived(data.length * (barHeight + gap) + mt + mb);
	const plotW = $derived(Math.max(containerWidth - marginLeft - marginRight, 1));

	const rows = $derived(
		data.map((d) => {
			const vals = keys.map((k) => (d[k] as number) ?? 0);
			const total = vals.reduce((s, v) => s + v, 0) || 1;
			let x = 0;
			return {
				label: d.label as string,
				segments: keys.map((k, i) => {
					const raw = (d[k] as number) ?? 0;
					const pct = normalized ? (raw / total) * 100 : raw;
					const seg = { key: k, raw, pct, x, color: colors[i] ?? '#ccc' };
					x += pct;
					return seg;
				}),
				total
			};
		})
	);

	const xMax = $derived(normalized ? 100 : (d3.max(rows, (r) => r.total) ?? 1));
	const xScale = $derived(d3.scaleLinear().domain([0, xMax]).range([0, plotW]));

	function pct(val: number, total: number) {
		return ((val / total) * 100).toFixed(0) + '%';
	}
</script>

<div class="chart-wrap" bind:clientWidth={containerWidth}>
	<svg width={containerWidth} height={svgHeight} role="img" aria-label="Stacked bar chart">
		{#each rows as row, i}
			{@const y = mt + i * (barHeight + gap)}
			<text
				x={marginLeft - 8}
				y={y + barHeight / 2}
				text-anchor="end"
				dominant-baseline="middle"
				class="bar-label"
			>{row.label}</text>

			<!-- track -->
			<rect x={marginLeft} {y} width={plotW} height={barHeight} fill="#F1F5F9" rx="3" />

			{#each row.segments as seg}
				{@const sx = marginLeft + xScale(seg.x)}
				{@const sw = xScale(seg.pct)}
				<rect x={sx} {y} width={sw} height={barHeight} fill={seg.color} />
				{#if sw > 32}
					<text
						x={sx + sw / 2}
						y={y + barHeight / 2}
						text-anchor="middle"
						dominant-baseline="middle"
						style="font: 500 10px 'Inter', sans-serif; fill: white;"
					>{pct(seg.raw, row.total)}</text>
				{/if}
			{/each}
		{/each}

		<!-- legend -->
		{#each keys as key, i}
			{@const lx = marginLeft + (plotW / keys.length) * i}
			<rect x={lx} y={svgHeight - mb + 12} width={12} height={12} fill={colors[i]} rx="2" />
			<text
				x={lx + 16}
				y={svgHeight - mb + 18}
				dominant-baseline="middle"
				class="axis-tick"
				style="font-size: 11px; fill: #64748B;"
			>{labels[i] ?? key}</text>
		{/each}
	</svg>
</div>
