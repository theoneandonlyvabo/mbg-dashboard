<script lang="ts">
	import * as d3 from 'd3';
	import { onMount, onDestroy, untrack } from 'svelte';
	import { fmtShort, fmtFull } from '$lib/format';
	import { normProv } from '$lib/geo';
	import type { GeoStat } from '$lib/types';
	import type { Map as LMap, GeoJSON, Layer, PathOptions } from 'leaflet';
	import 'leaflet/dist/leaflet.css';

	let {
		stats,
		selectedKey = $bindable(''),
		onselect
	}: {
		stats: Record<string, GeoStat>;
		selectedKey?: string;
		onselect?: (key: string) => void;
	} = $props();

	let el: HTMLDivElement;
	let map: LMap | null = null;
	let geoLayer: GeoJSON | null = null;
	const layerByKey = new Map<string, Layer>();
	let ro: ResizeObserver | null = null;

	const maxVal = untrack(() => Math.max(1, ...Object.values(stats).map((s) => s.penerima)));
	const color = d3.scaleSequentialSqrt<string>().domain([0, maxVal]).interpolator(d3.interpolateRgb('#CDEBD6', '#14532D'));
	const ranked = untrack(() => Object.values(stats).sort((a, b) => b.penerima - a.penerima).map((s) => s.key));
	const NO_DATA = '#E5E9EF';

	function baseStyle(key: string): PathOptions {
		const s = stats[key];
		return {
			fillColor: s ? color(s.penerima) : NO_DATA,
			fillOpacity: 0.88,
			color: '#ffffff',
			weight: 0.7
		};
	}
	function selStyle(): PathOptions {
		return { color: '#0F1B2D', weight: 2.2, fillOpacity: 1 };
	}
	function hoverStyle(): PathOptions {
		return { color: '#0F1B2D', weight: 1.8, fillOpacity: 1 };
	}

	const legendStops = [0, 0.25, 0.5, 0.75, 1];

	onMount(async () => {
		const L = (await import('leaflet')).default;
		const geo = await (await fetch('/indonesia-provinces.json')).json();

		map = L.map(el, {
			zoomControl: true,
			scrollWheelZoom: false,
			attributionControl: true,
			minZoom: 4,
			maxZoom: 8
		});
		L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
			attribution: '&copy; OpenStreetMap &copy; CARTO',
			subdomains: 'abcd'
		}).addTo(map);

		geoLayer = L.geoJSON(geo, {
			style: (f) => baseStyle(normProv(f!.properties.PROVINSI)),
			onEachFeature: (f, layer) => {
				const key = normProv(f.properties.PROVINSI);
				const s = stats[key];
				const rank = ranked.indexOf(key);
				layerByKey.set(key, layer);

				layer.bindTooltip(
					s
						? `<b>${f.properties.PROVINSI}</b><br>${fmtFull(s.penerima)} penerima · #${rank + 1}`
						: `<b>${f.properties.PROVINSI}</b><br>Data tidak tersedia`,
					{ sticky: true, className: 'map-tt' }
				);

				layer.on({
					mouseover: (e) => e.target.setStyle(hoverStyle()),
					mouseout: (e) => {
						if (key !== selectedKey) e.target.setStyle(baseStyle(key));
					},
					click: () => {
						if (!s) return;
						selectedKey = key;
						onselect?.(key);
					}
				});
			}
		}).addTo(map);

		map.fitBounds(geoLayer.getBounds(), { padding: [8, 8] });
		map.setMaxBounds(geoLayer.getBounds().pad(0.25));
		applySelected();

		ro = new ResizeObserver(() => map?.invalidateSize());
		ro.observe(el);
	});

	function applySelected() {
		if (!geoLayer) return;
		layerByKey.forEach((layer, key) => {
			(layer as Layer & { setStyle: (s: PathOptions) => void }).setStyle(key === selectedKey ? { ...baseStyle(key), ...selStyle() } : baseStyle(key));
		});
	}

	// re-highlight when selection changes externally
	$effect(() => {
		selectedKey;
		applySelected();
	});

	onDestroy(() => {
		ro?.disconnect();
		map?.remove();
	});
</script>

<div class="map-shell">
	<div class="map" bind:this={el}></div>
	<div class="legend">
		<span class="legend-cap">Penerima manfaat</span>
		<div class="legend-bar">
			{#each legendStops as s}
				<span style:background={color(maxVal * s)}></span>
			{/each}
		</div>
		<div class="legend-scale num"><span>0</span><span>{fmtShort(maxVal)}</span></div>
		<span class="legend-nd"><span class="nd-sw"></span> Tanpa data</span>
	</div>
</div>

<style>
	.map-shell { width: 100%; }
	.map {
		width: 100%;
		height: 440px;
		border-radius: 12px;
		overflow: hidden;
		border: 1px solid var(--rule);
		background: #EDF1F5;
	}
	/* tame Leaflet chrome to match the light theme */
	:global(.leaflet-container) { font-family: var(--font-body); background: #EDF1F5; }
	:global(.leaflet-control-zoom a) {
		background: #fff;
		color: var(--ink-2);
		border-color: var(--rule);
	}
	:global(.leaflet-control-attribution) { font-size: 9px; background: rgba(255, 255, 255, 0.7); }
	:global(.map-tt) {
		background: rgba(15, 23, 42, 0.96);
		color: #F8FAFC;
		border: none;
		border-radius: 8px;
		box-shadow: 0 14px 34px -16px rgba(15, 23, 42, 0.5);
		font-size: 0.75rem;
		padding: 0.45rem 0.6rem;
	}
	:global(.map-tt b) { color: #fff; font-weight: 700; }
	:global(.map-tt::before) { display: none; }

	.legend { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; margin-top: 0.7rem; }
	.legend-cap { font-size: 0.7rem; color: var(--ink-2); }
	.legend-bar { display: flex; height: 9px; width: 150px; border-radius: 5px; overflow: hidden; }
	.legend-bar span { flex: 1; }
	.legend-scale { display: flex; justify-content: space-between; width: 150px; font-size: 0.625rem; color: var(--ink-3); }
	.legend-nd { display: flex; align-items: center; gap: 0.35rem; font-size: 0.7rem; color: var(--ink-3); margin-left: auto; }
	.nd-sw { width: 11px; height: 11px; border-radius: 3px; background: #E5E9EF; border: 1px solid var(--rule); }
</style>
