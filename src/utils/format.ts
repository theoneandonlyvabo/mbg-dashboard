export const fmt = (n: number | undefined | null): string => {
  if (n === undefined || n === null) return '0';
  return Math.round(n).toLocaleString('id-ID');
};

export const fmt1 = (n: number | undefined | null): string => {
  if (n === undefined || n === null) return '0';
  return Number(n).toLocaleString('id-ID', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
};

export const pct = (n: number | undefined | null): string => {
  if (n === undefined || n === null) return '0%';
  return Number(n).toLocaleString('id-ID', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }) + '%';
};

export const growth = (a: number, b: number): number | null => {
  if (!a || !b) return null;
  return ((b - a) / a) * 100;
};
