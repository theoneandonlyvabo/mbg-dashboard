/** Canonical province key shared by the CSV aggregation and the GeoJSON match. */
export function normProv(raw: string): string {
	const s = raw
		.replace(/^Prov\.?\s*/i, '')
		.toUpperCase()
		.replace(/\./g, '')
		.replace(/\s+/g, ' ')
		.trim();
	if (s.includes('YOGYAKARTA')) return 'YOGYAKARTA';
	if (s.includes('JAKARTA')) return 'DKI JAKARTA';
	return s;
}

/** Friendly display name from a raw CSV province string. */
export function displayProv(raw: string): string {
	return raw.replace(/^Prov\.?\s*/i, '').replace('D.K.I.', 'DKI').replace('D.I.', 'DI');
}
