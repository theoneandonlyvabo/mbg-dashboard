import type { MBGRecord, AggResult } from '../types';

export const emptyAgg = (): AggResult => ({
  pm: 0, s: 0, l: 0, pr: 0, al: 0, fo: 0, in: 0,
  kk: 0, sn: 0, ss: 0, kn: 0, ks: 0, c: 0,
});

export const addRecord = (a: AggResult, r: MBGRecord): AggResult => ({
  pm: a.pm + r.pm,
  s: a.s + r.s,
  l: a.l + r.l,
  pr: a.pr + r.pr,
  al: a.al + r.al,
  fo: a.fo + r.fo,
  in: a.in + r.in,
  kk: a.kk + r.kk,
  sn: a.sn + r.sn,
  ss: a.ss + r.ss,
  kn: a.kn + r.kn,
  ks: a.ks + r.ks,
  c: a.c + 1,
});

export const aggAll = (recs: MBGRecord[]): AggResult =>
  recs.reduce(addRecord, emptyAgg());

export const groupBy = <K extends string>(
  recs: MBGRecord[],
  fn: (r: MBGRecord) => K
): Record<K, AggResult> => {
  const map = {} as Record<K, AggResult>;
  for (const r of recs) {
    const k = fn(r);
    if (!map[k]) map[k] = emptyAgg();
    map[k] = addRecord(map[k], r);
  }
  return map;
};
