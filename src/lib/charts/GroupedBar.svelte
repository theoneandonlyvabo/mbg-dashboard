<script lang="ts">
	import * as d3 from 'd3';
	import { fmtShort, fmtFull } from '$lib/format';
	import Tooltip from './Tooltip.svelte';

	let {
		data,
		keys = ['alergi', 'fobia', 'intoleransi'],
		labels = ['Alergi', 'Fobia Makanan', 'Intoleransi'],
		colors = ['var(--c4)', 'var(--c8)', 'var(--c6)'],
		subBarHeight = 10,
		subGap = 3,
		groupGap = 15,
		marginLeft = 150,
		marginRight = 56
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

	let containerWidth = $state(640);
	const groupH = $derived(keys.length * (subBarHeight + subGap) - subGap);
	const rowH = $derived(groupH + groupGap);
	const legendH = 30;
	const mt = 2;
	const svgHeight = $derived(data.length * rowH + mt + legendH);
	const plotW = $derived(Math.max(containerWidth - marginLeft - marginRight, 1));

	const xMax = $derived(d3.max(data, (d) => d3.max(keys, (k) => (d[k] as number) ?? 0)) ?? 1);
	const xScale = $derived(d3.scaleLinear().domain([0, xMax]).range([0, plotW]).nice());

	let tt = $state({ x: 0, y: 0, visible: false, title: '', rows: [] as { label: string; value: string; color: string }[] });

	function show(e: MouseEvent, row: { label: string; [k: string]: number | string }) {
		const rect = (e.currentTarget as Element).closest('.chart-wrap')!.getBoundingClientRect();
		tt = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
			visible: true,
			title: row.label as string,
			rows: keys.map((k, i) => ({ label: labels[i] ?? k, value: fmtFull((row[k] as number) ?? 0), color: colors[i] }))
		};
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
	<svg width={containerWidth} height={svgHeight} role="img" aria-label="Grouped bar chart">
		{#each data as row, i (row.label)}
			{@const gy = mt + i * rowH}
			<rect
				x={marginLeft}
				y={gy - 3}
				width={plotW}
				height={groupH + 6}
				fill="transparent"
				onmouseenter={(e) => show(e, row)}
				onmousemove={move}
				onmouseleave={hide}
				role="presentation"
			/>
			<text x={marginLeft - 12} y={gy + groupH / 2} text-anchor="end" dominant-baseline="middle" class="bar-label">{row.label}</text>
			{#each keys as key, ki (key)}
				{@const by = gy + ki * (subBarHeight + subGap)}
				{@const val = (row[key] as number) ?? 0}
				{@const bw = xScale(val)}
				<rect x={marginLeft} y={by} width={plotW} height={subBarHeight} fill="var(--track)" rx="3" />
				<rect x={marginLeft} y={by} width={bw} height={subBarHeight} fill={colors[ki]} rx="3" opacity="0.92" style="transition: width 0.7s var(--ease);" />
				{#if bw > 2}
					<text x={marginLeft + bw + 6} y={by + subBarHeight / 2} dominant-baseline="middle" class="bar-value" style="font-size:9.5px;">{fmtShort(val)}</text>
				{/if}
			{/each}
		{/each}

		{#each keys as key, ki (key)}
			{@const lx = marginLeft + (plotW / keys.length) * ki}
			<rect x={lx} y={svgHeight - legendH + 8} width="9" height="9" fill={colors[ki]} rx="2" />
			<text x={lx + 14} y={svgHeight - legendH + 13} dominant-baseline="middle" style="font:400 11px var(--font-body); fill:var(--ink-2);">{labels[ki] ?? key}</text>
		{/each}
	</svg>

	<Tooltip x={tt.x} y={tt.y} visible={tt.visible} title={tt.title} rows={tt.rows} />
</div>
