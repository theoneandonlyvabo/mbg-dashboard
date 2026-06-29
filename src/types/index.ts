export interface MBGRecord {
  p: string;
  k: string;
  c: string;
  j: string;
  s: number;
  l: number;
  pr: number;
  al: number;
  fo: number;
  in: number;
  pm: number;
  kk: number;
  sn: number;
  ss: number;
  sp: number;
  kn: number;
  ks: number;
}

export interface TrenPeriod {
  period: number;
  label: string;
  pm: number;
  s: number;
  l: number;
  pr: number;
  kk: number;
  sn: number;
  ss: number;
  kec: number;
  prov: number;
}

export interface TrenData {
  tren: TrenPeriod[];
  tren_jenjang: Record<string, Record<string, number>>;
}

export interface FilterState {
  prov: string;
  kab: string;
  kec: string;
  jenjang: string;
  status: string;
}

export interface AggResult {
  pm: number;
  s: number;
  l: number;
  pr: number;
  al: number;
  fo: number;
  in: number;
  kk: number;
  sn: number;
  ss: number;
  kn: number;
  ks: number;
  c: number;
}

export type NavSection = 'sec1' | 'sec2' | 'sec3' | 'sec4' | 'sec5' | 'sec6' | 'sec7' | 'sec8' | 'sec9';

export interface Hierarchy {
  [prov: string]: {
    [kab: string]: string[];
  };
}

export interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  title: string;
  rows: [string, string][];
}
