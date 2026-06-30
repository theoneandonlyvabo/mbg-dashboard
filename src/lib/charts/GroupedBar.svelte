<script lang="ts">
	import * as d3 from 'd3';
	import { fmtShort } from '$lib/format';

	let {
		data,
		keys = ['alergi', 'fobia', 'intoleransi'],
		labels = ['Alergi', 'Fobia Makanan', 'Intoleransi'],
		colors = ['#F59E0B', '#6366F1', '#10B981'],
		subBarHeight = 14,
		subGap = 4,
		groupGap = 20,
		marginLeft = 180,
		marginRight = 72
	}: {
		data: { label: string; [key: string]: number | string }[];
		keys?: string[];
		labels?: string[];
		colors?: string[];
		subBarHeight?: number;
		subGap?: number;
		groupGap?: number;
		marginLeft?: number;
		marginRight?: number;
	} = $props();

	let containerWidth = $state(700);

	const groupH = $derived(keys.length * (subBarHeight + subGap) - subGap);
	const rowH = $derived(groupH + groupGap);
	const legendH = 36;
	const mt = 4;
	const svgHeight = $derived(data.length * rowH + mt + legendH);
	const plotW = $derived(Math.max(containerWidth - marginLeft - marginRight, 1));

	const xMax = $derived(
		d3.max(data, (d) => d3.max(keys, (k) => (d[k] as number) ?? 0)) ?? 1
	);
	const xScale = $derived(d3.scaleLinear().domain([0, xMax]).range([0, plotW]).nice());
</script>

<div class="chart-wrap" bind:clientWidth={containerWidth}>
	<svg width={containerWidth} height={svgHeight} role="img" aria-label="Grouped bar chart">
		{#each data as row, i}
			{@const gy = mt + i * rowH}
			<!-- row label centered vertically in group -->
			<text
				x={marginLeft - 10}
				y={gy + groupH / 2}
				text-anchor="end"
				dominant-baseline="middle"
				class="bar-label"
			>{row.label}</text>

			{#each keys as key, ki}
				{@const by = gy + ki * (subBarHeight + subGap)}
				{@const val = (row[key] as number) ?? 0}
				{@const bw = xScale(val)}

				<!-- track -->
				<rect x={marginLeft} y={by} width={plotW} height={subBarHeight} fill="#F1F5F9" rx="2" />
				<!-- fill -->
				<rect
					x={marginLeft}
					y={by}
					width={bw}
					height={subBarHeight}
					fill={colors[ki]}
					rx="2"
					style="transition: width 0.6s cubic-bezier(0.22,1,0.36,1)"
				/>
				<!-- value -->
				{#if bw > 0}
					<text
						x={marginLeft + bw + 5}
						y={by + subBarHeight / 2}
						dominant-baseline="middle"
						class="bar-value"
					>{fmtShort(val)}</text>
				{/if}
			{/each}
		{/each}

		<!-- legend -->
		{#each keys as key, ki}
			{@const lx = marginLeft + (plotW / keys.length) * ki}
			<rect x={lx} y={svgHeight - legendH + 8} width={10} height={10} fill={colors[ki]} rx="2" />
			<text
				x={lx + 14}
				y={svgHeight - legendH + 13}
				dominant-baseline="middle"
				style="font: 400 11px 'Inter', sans-serif; fill: #64748B;"
			>{labels[ki] ?? key}</text>
		{/each}
	</svg>
</div>
