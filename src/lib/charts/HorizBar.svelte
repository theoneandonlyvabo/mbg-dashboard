<script lang="ts">
	import * as d3 from 'd3';
	import { fmtShort, fmtFull } from '$lib/format';
	import Tooltip from './Tooltip.svelte';

	let {
		data,
		color = 'var(--accent)',
		colors,
		barHeight = 22,
		gap = 9,
		marginLeft = 150,
		marginRight = 56,
		valueSuffix = ''
	}: {
		data: { label: string; value: number }[];
		color?: string;
		colors?: string[];
		barHeight?: number;
		gap?: number;
		marginLeft?: number;
		marginRight?: number;
		valueSuffix?: string;
	} = $props();

	let containerWidth = $state(800);
	const mt = 2;
	const mb = 2;

	const svgHeight = $derived(data.length * (barHeight + gap) + mt + mb);
	const xMax = $derived(d3.max(data, (d) => d.value) ?? 1);
	const plotW = $derived(Math.max(containerWidth - marginLeft - marginRight, 1));
	const xScale = $derived(d3.scaleLinear().domain([0, xMax]).range([0, plotW]));

	let tt = $state({ x: 0, y: 0, visible: false, title: '', value: 0, color: '' });

	function show(e: MouseEvent, label: string, value: number, c: string) {
		const rect = (e.currentTarget as Element).closest('.chart-wrap')!.getBoundingClientRect();
		tt = { x: e.clientX - rect.left, y: e.clientY - rect.top, visible: true, title: label, value, color: c };
	}
	function move(e: MouseEvent) {
		const rect = (e.currentTarget as Element).closest('.chart-wrap')!.getBoundingClientRect();
		tt = { ...tt, x: e.clientX - rect.left, y: e.clientY - rect.top };
	}
	function hide() {
		tt = { ...tt, visible: false };
	}
</script>

<div class="chart-wrap" bind:clientWidth={containerWidth}>
	<svg width={containerWidth} height={svgHeight} role="img" aria-label="Horizontal bar chart">
		{#each data as bar, i (bar.label)}
			{@const y = mt + i * (barHeight + gap)}
			{@const barW = xScale(bar.value)}
			{@const fill = colors ? colors[i % colors.length] : color}
			<text x={marginLeft - 12} y={y + barHeight / 2} text-anchor="end" dominant-baseline="middle" class="bar-label">{bar.label}</text>
			<rect x={marginLeft} {y} width={plotW} height={barHeight} fill="var(--track)" rx="5" />
			<rect
				x={marginLeft}
				{y}
				width={barW}
				height={barHeight}
				fill={fill}
				rx="5"
				opacity="0.92"
				style="transition: width 0.7s var(--ease);"
				onmouseenter={(e) => show(e, bar.label, bar.value, fill)}
				onmousemove={move}
				onmouseleave={hide}
				role="presentation"
			/>
			<text x={marginLeft + barW + 9} y={y + barHeight / 2} dominant-baseline="middle" class="bar-value">{fmtShort(bar.value)}{valueSuffix}</text>
		{/each}
	</svg>

	<Tooltip
		x={tt.x}
		y={tt.y}
		visible={tt.visible}
		title={tt.title}
		rows={[{ label: 'Penerima', value: fmtFull(tt.value), color: tt.color }]}
	/>
</div>
