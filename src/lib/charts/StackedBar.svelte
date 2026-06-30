<script lang="ts">
	import { fmtFull } from '$lib/format';
	import Tooltip from './Tooltip.svelte';

	let {
		data,
		keys = ['laki', 'perempuan'],
		colors = ['var(--c2)', 'var(--c5)'],
		labels = ['Laki-laki', 'Perempuan'],
		barHeight = 22,
		gap = 9,
		marginLeft = 62
	}: {
		data: { label: string; [key: string]: number | string }[];
		keys?: string[];
		colors?: string[];
		labels?: string[];
		barHeight?: number;
		gap?: number;
		marginLeft?: number;
	} = $props();

	let containerWidth = $state(560);
	const mt = 2;
	const mb = 30;

	const svgHeight = $derived(data.length * (barHeight + gap) + mt + mb);
	const plotW = $derived(Math.max(containerWidth - marginLeft - 8, 1));

	const rows = $derived(
		data.map((d) => {
			const vals = keys.map((k) => (d[k] as number) ?? 0);
			const total = vals.reduce((s, v) => s + v, 0) || 1;
			let acc = 0;
			return {
				label: d.label as string,
				total,
				segments: keys.map((k, i) => {
					const raw = (d[k] as number) ?? 0;
					const pct = (raw / total) * 100;
					const seg = { key: k, raw, pct, x: acc, color: colors[i] ?? '#888', label: labels[i] ?? k };
					acc += pct;
					return seg;
				})
			};
		})
	);

	let tt = $state({ x: 0, y: 0, visible: false, title: '', rows: [] as { label: string; value: string; color: string }[] });

	function show(e: MouseEvent, row: (typeof rows)[number]) {
		const rect = (e.currentTarget as Element).closest('.chart-wrap')!.getBoundingClientRect();
		tt = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
			visible: true,
			title: row.label,
			rows: row.segments.map((s) => ({ label: `${s.label} (${s.pct.toFixed(0)}%)`, value: fmtFull(s.raw), color: s.color }))
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
	<svg width={containerWidth} height={svgHeight} role="img" aria-label="Stacked bar chart">
		{#each rows as row, i (row.label)}
			{@const y = mt + i * (barHeight + gap)}
			<text x={marginLeft - 10} y={y + barHeight / 2} text-anchor="end" dominant-baseline="middle" class="bar-label">{row.label}</text>
			<rect x={marginLeft} {y} width={plotW} height={barHeight} fill="var(--track)" rx="5" />
			{#each row.segments as seg}
				{@const sx = marginLeft + (seg.x / 100) * plotW}
				{@const sw = (seg.pct / 100) * plotW}
				<rect
					x={sx}
					{y}
					width={Math.max(sw - 1.5, 0)}
					height={barHeight}
					fill={seg.color}
					rx="3"
					opacity="0.9"
					style="transition: width 0.7s var(--ease), x 0.7s var(--ease);"
					onmouseenter={(e) => show(e, row)}
					onmousemove={move}
					onmouseleave={hide}
					role="presentation"
				/>
				{#if sw > 36}
					<text x={sx + sw / 2} y={y + barHeight / 2} text-anchor="middle" dominant-baseline="middle" style="font:600 10px var(--font-mono); fill:#fff;">{seg.pct.toFixed(0)}%</text>
				{/if}
			{/each}
		{/each}

		{#each keys as key, i (key)}
			{@const lx = marginLeft + (plotW / keys.length) * i}
			<rect x={lx} y={svgHeight - mb + 10} width="9" height="9" fill={colors[i]} rx="2" />
			<text x={lx + 14} y={svgHeight - mb + 15} dominant-baseline="middle" style="font:400 11px var(--font-body); fill:var(--ink-2);">{labels[i] ?? key}</text>
		{/each}
	</svg>

	<Tooltip x={tt.x} y={tt.y} visible={tt.visible} title={tt.title} rows={tt.rows} />
</div>
