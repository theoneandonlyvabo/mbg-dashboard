export interface JenjangRow {
	jenjang: string;
	penerima: number;
	laki: number;
	perempuan: number;
	alergi: number;
	fobia: number;
	intoleransi: number;
	negeri: number;
	swasta: number;
}

export interface ProvinsiRow {
	label: string;
	penerima: number;
	laki: number;
	perempuan: number;
	alergi: number;
	fobia: number;
	intoleransi: number;
}

export interface SimpleBar {
	label: string;
	value: number;
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

export interface SekolahSplit {
	negeri: number;
	swasta: number;
}
