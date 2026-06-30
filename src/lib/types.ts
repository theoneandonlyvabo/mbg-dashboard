export interface SimpleBar {
	label: string;
	value: number;
}

export interface ProvinsiBar {
	label: string;
	value: number; // penerima
	laki: number;
	perempuan: number;
}

export interface SpecialRow {
	[key: string]: string | number;
	label: string;
	alergi: number;
	fobia: number;
	intoleransi: number;
}

export interface Totals {
	penerima: number;
	satpen: number;
	provinsi: number;
	kabkota: number;
}

/** A fully pre-aggregated view for one jenjang filter (or ALL). */
export interface View {
	totals: Totals;
	gender: { laki: number; perempuan: number };
	sekolah: { negeri: number; swasta: number };
	provinces: ProvinsiBar[];
	conditions: SpecialRow[];
	kabkota: SimpleBar[];
}

export interface JenjangDist {
	jenjang: string;
	penerima: number;
}
