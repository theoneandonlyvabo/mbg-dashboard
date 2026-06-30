<script lang="ts">
	type Tech = { name: string; slug: string; desc: string };
	type Group = { title: string; items: Tech[] };

	const groups: Group[] = [
		{
			title: 'Aplikasi & Bahasa',
			items: [
				{ name: 'SvelteKit', slug: 'svelte', desc: 'Framework UI, SSR & routing' },
				{ name: 'Svelte 5', slug: 'svelte', desc: 'Reaktivitas runes ($state/$derived)' },
				{ name: 'TypeScript', slug: 'typescript', desc: 'Tipe ketat untuk data & props' },
				{ name: 'Vite', slug: 'vite', desc: 'Dev server & bundler' },
				{ name: 'Bun', slug: 'bun', desc: 'Runtime & package manager' }
			]
		},
		{
			title: 'Visualisasi Data',
			items: [
				{ name: 'D3.js', slug: 'd3', desc: 'Skala, geo-path, skema warna' },
				{ name: 'SVG', slug: 'svg', desc: 'Bar, donut & grafik proyeksi' }
			]
		},
		{
			title: 'Peta & Data',
			items: [
				{ name: 'Leaflet', slug: 'leaflet', desc: 'Peta interaktif & overlay choropleth' },
				{ name: 'CARTO', slug: 'carto', desc: 'Basemap tiles (Positron light)' },
				{ name: 'OpenStreetMap', slug: 'openstreetmap', desc: 'Data peta dasar' },
				{ name: 'GeoJSON', slug: 'geojson', desc: 'Geometri 38 provinsi Indonesia' }
			]
		},
		{
			title: 'Desain & AI',
			items: [
				{ name: 'Inter', slug: 'googlefonts', desc: 'Tipografi via Google Fonts' },
				{ name: 'Claude Opus 4.8', slug: 'claude', desc: 'Analitik, proyeksi & engineering' }
			]
		}
	];

	function iconUrl(slug: string) {
		return `https://cdn.simpleicons.org/${slug}`;
	}
	// slugs not on Simple Icons → render a lettered fallback
	const FALLBACK = new Set(['svg', 'geojson']);

	const members = [
		{ name: 'Airel Adrivano', nim: '2410512135' },
		{ name: 'Daffa Fitriano', nim: '2410512125' },
		{ name: 'Gathfaan Agra Pratama', nim: '2410512107' },
		{ name: 'Sulthan Nadhif', nim: '2410512110' }
	];
</script>

<section class="tech">
	<div class="tech-head">
		<span class="tech-eyebrow">Di Balik Layar</span>
		<h2 class="tech-title">Tech Stack</h2>
		<p class="tech-sub">Seluruh teknologi yang menggerakkan dashboard ini.</p>
	</div>

	<div class="tech-groups">
		{#each groups as g (g.title)}
			<div class="tech-group">
				<span class="tech-group-title">{g.title}</span>
				<div class="tech-items">
					{#each g.items as t (t.name)}
						<div class="tech-item">
							<span class="tech-ico">
								{#if FALLBACK.has(t.slug)}
									<span class="tech-letter">{t.name.slice(0, 1)}</span>
								{:else}
									<img src={iconUrl(t.slug)} alt={t.name} width="24" height="24" loading="lazy" />
								{/if}
							</span>
							<span class="tech-text">
								<span class="tech-name">{t.name}</span>
								<span class="tech-desc">{t.desc}</span>
							</span>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<!-- GitHub + Team -->
	<div class="meta-row">
		<a class="gh-link" href="https://github.com/theoneandonlyvabo/mbg-dashboard" target="_blank" rel="noopener noreferrer" aria-label="Lihat source code di GitHub">
			<span class="gh-ico">
				<img src="https://cdn.simpleicons.org/github" alt="GitHub" width="18" height="18" />
			</span>
			<span class="gh-text">
				<span class="gh-repo">theoneandonlyvabo / mbg-dashboard</span>
				<span class="gh-sub">Source code · Open source</span>
			</span>
			<svg class="gh-arrow" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M3 8h10M9 4l4 4-4 4"/>
			</svg>
		</a>

		<div class="team">
			<span class="team-label">Anggota Kelompok</span>
			<div class="team-members">
				{#each members as m (m.nim)}
					<div class="member">
						<span class="member-name">{m.name}</span>
						<span class="member-nim num">{m.nim}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.tech { padding: 3rem 0 1rem; }
	.tech-head { margin-bottom: 1.75rem; }
	.tech-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		font-weight: 500;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--accent-strong);
	}
	.tech-title { font-family: var(--font-display); font-weight: 700; font-size: 1.5rem; letter-spacing: -0.02em; color: var(--ink); margin-top: 0.3rem; }
	.tech-sub { font-size: 0.8rem; color: var(--ink-2); margin-top: 0.15rem; }

	.tech-groups {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
		gap: 1.5rem;
	}
	.tech-group-title {
		display: block;
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-3);
		margin-bottom: 0.75rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--rule);
	}
	.tech-items { display: flex; flex-direction: column; gap: 0.5rem; }
	.tech-item {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		padding: 0.6rem 0.7rem;
		background: var(--surface);
		border: 1px solid var(--rule);
		border-radius: 10px;
		transition: border-color 0.25s var(--ease), transform 0.25s var(--ease), box-shadow 0.25s var(--ease);
	}
	.tech-item:hover {
		transform: translateY(-2px);
		border-color: var(--rule-strong);
		box-shadow: 0 12px 28px -20px rgba(15, 23, 42, 0.4);
	}
	.tech-ico {
		width: 38px;
		height: 38px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--surface-2);
		border-radius: 9px;
	}
	.tech-ico img { display: block; }
	.tech-letter { font-family: var(--font-display); font-weight: 800; font-size: 1rem; color: var(--accent-strong); }
	.tech-text { display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
	.tech-name { font-size: 0.85rem; font-weight: 600; color: var(--ink); }
	.tech-desc { font-size: 0.7rem; color: var(--ink-3); line-height: 1.3; }

	/* GitHub + Team */
	.meta-row {
		display: flex;
		align-items: flex-start;
		gap: 1.5rem;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--rule);
		flex-wrap: wrap;
	}
	.gh-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: var(--surface);
		border: 1px solid var(--rule);
		border-radius: 12px;
		text-decoration: none;
		transition: border-color 0.2s var(--ease), transform 0.2s var(--ease), box-shadow 0.2s var(--ease);
		flex-shrink: 0;
	}
	.gh-link:hover {
		border-color: var(--ink-3);
		transform: translateY(-2px);
		box-shadow: 0 10px 24px -16px rgba(15, 23, 42, 0.35);
	}
	.gh-ico {
		width: 36px;
		height: 36px;
		display: grid;
		place-items: center;
		background: var(--surface-2);
		border-radius: 8px;
		flex-shrink: 0;
	}
	.gh-ico img { display: block; }
	.gh-text { display: flex; flex-direction: column; gap: 0.1rem; }
	.gh-repo { font-size: 0.82rem; font-weight: 600; color: var(--ink); font-family: var(--font-mono); letter-spacing: -0.01em; }
	.gh-sub { font-size: 0.65rem; color: var(--ink-3); }
	.gh-arrow { color: var(--ink-3); flex-shrink: 0; }

	.team { display: flex; flex-direction: column; gap: 0.5rem; }
	.team-label {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		font-weight: 500;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-3);
	}
	.team-members {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.member {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.38rem 0.7rem;
		background: var(--surface);
		border: 1px solid var(--rule);
		border-radius: 999px;
	}
	.member-name { font-size: 0.75rem; font-weight: 500; color: var(--ink); }
	.member-nim { font-size: 0.65rem; color: var(--ink-3); }
</style>
