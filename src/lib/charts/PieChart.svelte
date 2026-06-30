<script lang="ts">
	interface Slice {
		label: string;
		value: number;
		color: string;
	}

	let { data, size = 180 }: { data: Slice[]; size?: number } = $props();

	const cx = size / 2;
	const cy = size / 2;
	const r = size / 2 - 3;

	const total = $derived(data.reduce((s, d) => s + d.value, 0) || 1);

	const segments = $derived.by(() => {
		let angle = -Math.PI / 2;
		return data.map((d) => {
			const sweep = (d.value / total) * Math.PI * 2;
			const start = angle;
			const end = angle + sweep;
			angle = end;

			const x1 = cx + r * Math.cos(start);
			const y1 = cy + r * Math.sin(start);
			const x2 = cx + r * Math.cos(end);
			const y2 = cy + r * Math.sin(end);
			const large = sweep > Math.PI ? 1 : 0;
			const path = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

			const mid = start + sweep / 2;
			const lx = cx + r * 0.62 * Math.cos(mid);
			const ly = cy + r * 0.62 * Math.sin(mid);
			const pct = (d.value / total) * 100;

			return { path, color: d.color, label: d.label, value: d.value, pct, lx, ly };
		});
	});
</script>

<div class="pie-wrap">
	<svg width={size} height={size} viewBox="0 0 {size} {size}" class="pie-svg" aria-hidden="true">
		{#each segments as seg, i (seg.label)}
			<path
				d={seg.path}
				fill={seg.color}
				stroke="var(--surface)"
				stroke-width="1.5"
				class="seg"
				style:animation-delay="{i * 0.05}s"
			/>
			{#if seg.pct > 7}
				<text
					x={seg.lx}
					y={seg.ly}
					text-anchor="middle"
					dominant-baseline="middle"
					class="pie-pct"
				>{seg.pct.toFixed(0)}%</text>
			{/if}
		{/each}
	</svg>

	<div class="legend">
		{#each segments as seg (seg.label)}
			<div class="leg-row">
				<span class="leg-dot" style:background={seg.color}></span>
				<span class="leg-name">{seg.label}</span>
				<span class="leg-pct num">{seg.pct.toFixed(1)}%</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.pie-wrap {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		width: 100%;
	}
	.pie-svg { flex-shrink: 0; }

	.seg {
		animation: seg-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) backwards;
	}
	@keyframes seg-in {
		from { opacity: 0; transform: scale(0.82); transform-origin: 50% 50%; }
		to   { opacity: 1; transform: scale(1);    transform-origin: 50% 50%; }
	}

	.pie-pct {
		font-size: 9px;
		font-weight: 700;
		fill: #fff;
		pointer-events: none;
		filter: drop-shadow(0 1px 2px rgba(0,0,0,0.35));
	}

	.legend {
		display: flex;
		flex-direction: column;
		gap: 0.32rem;
		flex: 1;
		min-width: 0;
	}
	.leg-row {
		display: flex;
		align-items: center;
		gap: 0.45rem;
	}
	.leg-dot {
		width: 8px;
		height: 8px;
		border-radius: 2px;
		flex-shrink: 0;
	}
	.leg-name {
		font-size: 0.68rem;
		color: var(--ink-2);
		font-weight: 500;
		flex: 1;
	}
	.leg-pct {
		font-size: 0.65rem;
		color: var(--ink);
		font-weight: 600;
	}
</style>
