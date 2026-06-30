# MBG Dashboard

> Real-time business intelligence for **Makan Bergizi Gratis** — Indonesia's national school nutrition program. Built fast, shipped clean.

**[mbg-dashboard-orpin.vercel.app](https://mbg-dashboard-orpin.vercel.app)**

---

## What This Is

A production-grade data dashboard that turns raw CSV government data into interactive charts, a choropleth map, AI-generated insights, and national coverage projections. No BI tool subscriptions. No vendor lock-in. Just code.

- **38 provinces** visualized on an interactive choropleth
- **Per-province drill-down** — click any province, see its jenjang breakdown
- **AI-powered insights** generated server-side from actual data
- **S-curve forecast** projecting coverage toward the 82.9M target by 2029
- **Jenjang filter** — slice every chart by SD, SMP, SMA, SMK, PAUD, SLB, SKB, PKBM simultaneously

---

## Stack

| Layer | Tech | Why |
|-------|------|-----|
| Framework | **SvelteKit 2 + Svelte 5** | Runes reactivity. Zero virtual DOM overhead. SSR out of the box. |
| Language | **TypeScript 6** | Strict mode. No `any`. Data integrity enforced at compile time. |
| Bundler | **Vite 8 + Rolldown** | Sub-second HMR. CSV bundled as raw string at build — no runtime fs reads. |
| Runtime | **Bun** | 3× faster installs. Native TS execution. |
| Maps | **Leaflet 1.9** | Lightweight interactive maps. CARTO Positron basemap. |
| Geo | **D3.js 7** | Sequential color scales, sqrt domain normalization for choropleth. |
| Charts | **Custom SVG** | Zero-dependency bar, donut, stacked, grouped, and pie components. |
| Data | **GeoJSON (38 provinces)** | Indonesian provincial geometry. Normalized province name matching. |
| AI | **Claude Opus 4.8** | Server-side insight generation — confidence scoring, method attribution. |
| Deployment | **Vercel (adapter-auto)** | Edge-ready. Serverless. Auto-deploys on push. |
| Fonts | **Inter** | Variable font. Ships via Google Fonts with `font-display: swap`. |

---

## Architecture

```
src/
├── routes/
│   ├── +page.server.ts   # CSV parse → multi-view aggregation → AI insights
│   └── +page.svelte      # Bento grid layout, filter state, province drill-down
├── lib/
│   ├── charts/
│   │   ├── ChoroplethMap.svelte   # Leaflet + D3 color scale
│   │   ├── PieChart.svelte        # SVG pie with animated segments
│   │   ├── DonutChart.svelte      # SVG donut
│   │   ├── HorizBar.svelte        # Horizontal bar chart
│   │   ├── StackedBar.svelte      # 100% stacked bar
│   │   ├── GroupedBar.svelte      # Multi-series grouped bar
│   │   └── ForecastChart.svelte   # S-curve projection with confidence band
│   ├── geo.ts            # Province name normalization (38 variants → canonical keys)
│   ├── format.ts         # Number formatters (fmtShort, fmtFull)
│   ├── types.ts          # Shared interfaces (View, GeoStat, Insight, etc.)
│   └── TechStack.svelte  # Tech attribution + team
static/
├── data.csv                  # MASTER_DATASET_MBG_BI2026
└── indonesia-provinces.json  # GeoJSON provincial geometries
```

**Data flow**: CSV imported as `?raw` at build time → server load parses + aggregates into per-jenjang views + per-province geo stats → all passed as typed `PageData` → components render from props, zero client-side fetching for core data.

---

## Local Dev

```sh
bun install
bun run dev
```

Open [localhost:5173](http://localhost:5173).

```sh
bun run build    # production build
bun run preview  # preview production build locally
```

---

## Team

Built for **Business Intelligence 2026** — Universitas Pembangunan Nasional Veteran Jakarta.

| Name | NIM |
|------|-----|
| Airel Adrivano | 2410512135 |
| Daffa Fitriano | 2410512125 |
| Gathfaan Agra Pratama | 2410512107 |
| Sulthan Nadhif | 2410512110 |

---

**Data source**: Kementerian Pendidikan Dasar & Menengah RI · `MASTER_DATASET_MBG_BI2026`
