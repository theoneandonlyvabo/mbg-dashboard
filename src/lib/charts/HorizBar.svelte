<script lang="ts">
	import * as d3 from 'd3';
	import { fmtShort } from '$lib/format';

	let {
		data,
		color = '#2563EB',
		barHeight = 30,
		gap = 8,
		marginLeft = 160,
		marginRight = 72,
		colors
	}: {
		data: { label: string; value: number }[];
		color?: string;
		barHeight?: number;
		gap?: number;
		marginLeft?: number;
		marginRight?: number;
		colors?: string[];
	} = $props();

	let containerWidth = $state(800);

	const mt = 4;
	const mb = 4;

	const svgHeight = $derived(data.length * (barHeight + gap) + mt + mb);

	const xMax = $derived(d3.max(data, (d) => d.value) ?? 1);
	const plotW = $derived(Math.max(containerWidth - marginLeft - marginRight, 1));

	const xScale = $derived(d3.scaleLinear().domain([0, xMax]).range([0, plotW]).nice());
</script>

<div class="chart-wrap" bind:clientWidth={containerWidth}>
	<svg width={containerWidth} height={svgHeight} role="img" aria-label="Horizontal bar chart">
		{#each data as bar, i}
			{@const y = mt + i * (barHeight + gap)}
			{@const barW = xScale(bar.value)}
			{@const fill = colors ? colors[i % colors.length] : color}
			<!-- label -->
			<text
				x={marginLeft - 10}
				y={y + barHeight / 2}
				text-anchor="end"
				dominant-baseline="middle"
				class="bar-label"
			>{bar.label}</text>
			<!-- bar background -->
			<rect
				x={marginLeft}
				{y}
				width={plotW}
				height={barHeight}
				fill="#F1F5F9"
				rx="3"
			/>
			<!-- bar fill -->
			<rect
				x={marginLeft}
				{y}
				width={barW}
				height={barHeight}
				{fill}
				rx="3"
				style="transition: width 0.6s cubic-bezier(0.22,1,0.36,1)"
			/>
			<!-- value label -->
			<text
				x={marginLeft + barW + 8}
				y={y + barHeight / 2}
				dominant-baseline="middle"
				class="bar-value"
			>{fmtShort(bar.value)}</text>
		{/each}
	</svg>
</div>
