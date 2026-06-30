export function fmtShort(n: number): string {
	if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + ' Jt';
	if (n >= 1_000) return Math.round(n / 1_000) + 'K';
	return n.toString();
}

export function fmtFull(n: number): string {
	return new Intl.NumberFormat('id-ID').format(n);
}
