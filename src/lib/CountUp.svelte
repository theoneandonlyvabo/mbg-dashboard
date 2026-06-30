<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { untrack } from 'svelte';

	let { value, duration = 900 }: { value: number; duration?: number } = $props();

	const tween = new Tween(0, { duration: untrack(() => duration), easing: cubicOut });

	$effect(() => {
		tween.target = value;
	});

	const display = $derived(new Intl.NumberFormat('id-ID').format(Math.round(tween.current)));
</script>

<span class="num">{display}</span>
