<script lang="ts">
	let {
		x,
		y,
		visible,
		title,
		rows = []
	}: {
		x: number;
		y: number;
		visible: boolean;
		title: string;
		rows?: { label: string; value: string; color?: string }[];
	} = $props();
</script>

{#if visible}
	<div class="tt" style="left:{x}px; top:{y}px;">
		<div class="tt-title">{title}</div>
		{#each rows as r}
			<div class="tt-row">
				{#if r.color}<span class="tt-dot" style:background={r.color}></span>{/if}
				<span class="tt-label">{r.label}</span>
				<span class="tt-val num">{r.value}</span>
			</div>
		{/each}
	</div>
{/if}

<style>
	.tt {
		position: absolute;
		transform: translate(-50%, -115%);
		background: rgba(15, 23, 42, 0.96);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 9px;
		padding: 0.5rem 0.65rem;
		pointer-events: none;
		z-index: 30;
		min-width: 130px;
		box-shadow: 0 16px 40px -16px rgba(15, 23, 42, 0.5);
		backdrop-filter: blur(8px);
		animation: pop 0.14s var(--ease);
	}
	@keyframes pop {
		from { opacity: 0; transform: translate(-50%, -105%); }
		to { opacity: 1; transform: translate(-50%, -115%); }
	}
	.tt-title {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 0.8125rem;
		color: #F8FAFC;
		margin-bottom: 0.35rem;
		white-space: nowrap;
	}
	.tt-row {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.75rem;
		color: #B6C2D1;
		line-height: 1.6;
	}
	.tt-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
	.tt-label { flex: 1; white-space: nowrap; }
	.tt-val { color: #F8FAFC; font-weight: 500; }
</style>
