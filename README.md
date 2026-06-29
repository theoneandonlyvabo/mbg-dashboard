# MBG Dashboard 2026

Executive Monitoring Dashboard — Program Makan Bergizi Gratis  
Built with **React + TypeScript + Vite**

## Stack
- React 18 + TypeScript
- Vite (build tool)
- Pure CSS — custom design system, no Tailwind
- Custom SVG charts — no chart library
- 3,347 baris data ETL nasional (hardcoded, siap extend ke API)

## Struktur
```
src/
  types/          TypeScript interfaces
  data/
    records.ts    3347 data records MBG
    constants.ts  TREN, HIERARCHY, config constants
  hooks/
    useFilter.ts  Filter state + useMemo derived records
    useTooltip.ts
  utils/
    format.ts     fmt, pct, growth formatters
    aggregation.ts aggAll, groupBy
  components/
    layout/       Topbar, NavTabs
    sections/     Sec1-Sec9
    charts/       DonutChart, BarList, SVGCharts
    ui/           Tooltip
```

## Deploy ke Vercel

```bash
npm install
npm run build
# push ke GitHub, connect di vercel.com
# Framework: Vite | Build: npm run build | Output: dist
```

## Sections
1. Executive Summary — KPI cards + donut charts
2. Analisis Wilayah — Choropleth grid + top/bottom 10
3. Analisis Demografi — Jenjang, gender, heatmap
4. Kondisi Khusus — Chip cards, treemap, risk table
5. Penerima Manfaat — Coverage ratio, ranking table
6. Analisis Sekolah — Negeri vs swasta breakdown
7. Analisis Tren — April to Mei to Juni 2026
8. Deep Dive — Drill-down Prov ke Kab ke Kec
9. Insight Engine — Auto-generated insights + advanced KPIs
