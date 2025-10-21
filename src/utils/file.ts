import { SetStateAction } from 'react';
import { Series } from '../pages/managementRecords/detail/aqm/[id]';

const MAX_SIZE = 30 * 1024 * 1024; // 30MB

export const handleFiles = (
	files: FileList | null,
	setError: (value: SetStateAction<string | null>) => void,
	onFileChange: (file: File | null) => void,
	acceptedTypes: string[]
) => {
	if (!files || files.length === 0) return;
	const file = files[0];
	if (file.size > MAX_SIZE) {
		setError('파일 용량은 최대 30MB까지 가능합니다.');
		onFileChange(null);
		return;
	}
	// 확장자 검사
	const isAccepted = acceptedTypes.some(
		(type) =>
			file.name.endsWith(type.replace(/^\./, '')) ||
			file.name.endsWith(type)
	);
	if (!isAccepted) {
		setError(`${acceptedTypes.join(', ')} 파일만 업로드 가능합니다.`);
		onFileChange(null);
		return;
	}
	setError(null);
	onFileChange(file);
};

export const fileNameFromPath = (path: string) => {
	const parts = path.split('/');
	return parts[parts.length - 1] || 'floor-plan';
};

export function inferMimeFromExt(name: string): string | undefined {
	const ext = name.split('.').pop()?.toLowerCase();
	if (!ext) return undefined;
	const map: Record<string, string> = {
		png: 'image/png',
		jpg: 'image/jpeg',
		jpeg: 'image/jpeg',
		csv: 'text/csv',
		xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		xls: 'application/vnd.ms-excel',
		pdf: 'application/pdf',
	};
	return map[ext];
}

/** 견고한 CSV 한 줄 파서 (따옴표/쉼표/빈 마지막 컬럼 대응) */
function parseCsvLine(line: string): string[] {
	const out: string[] = [];
	let cur = '';
	let inQuotes = false;
	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (ch === '"') {
			if (inQuotes && line[i + 1] === '"') {
				cur += '"';
				i++; // 이스케이프된 따옴표
			} else {
				inQuotes = !inQuotes;
			}
		} else if (ch === ',' && !inQuotes) {
			out.push(cur.trim());
			cur = '';
		} else {
			cur += ch;
		}
	}
	out.push(cur.trim());
	return out;
}

/** 파일 전체를 CSV 2차원 배열로 */
function parseCsv(text: string): string[][] {
	return text
		.split(/\r?\n/)
		.filter((l) => l.trim().length > 0)
		.map(parseCsvLine);
}

/** 헤더행 찾기: Record/Mode/Location 포함 */
function findHeaderIndex(rows: string[][]): number {
	const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase();
	return rows.findIndex((cells) => {
		const s = cells.map(norm);
		return (
			s.includes('record') && s.includes('mode') && s.includes('location')
		);
	});
}

/** 헤더 인덱스 구하기 (Location, Ch1/2/3 Data) */
function resolveIndexes(header: string[]) {
	const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
	const idxLocation = header.findIndex((h) => /\blocation\b/i.test(norm(h)));
	if (idxLocation < 0) throw new Error('Location 컬럼을 찾지 못했습니다.');

	const findBy = (re: RegExp) => header.findIndex((h) => re.test(norm(h)));
	const idxCh1 = findBy(/\bch\s*1\b.*\bdata\b/i);
	const idxCh2 = findBy(/\bch\s*2\b.*\bdata\b/i);
	const idxCh3 = findBy(/\bch\s*3\b.*\bdata\b/i);
	if (idxCh1 < 0 || idxCh2 < 0 || idxCh3 < 0) {
		throw new Error('Ch1/Ch2/Ch3 Data 컬럼을 찾지 못했습니다.');
	}
	return { idxLocation, idxCh1, idxCh2, idxCh3 };
}

const toNum = (v: unknown) => {
	const n = Number(String(v ?? '').replace(/[^0-9.\-eE]/g, ''));
	return Number.isFinite(n) ? n : NaN;
};

/** 최종: pmFile → 채널별(series 3개) 데이터 */
export async function buildPmDataByChannel(
	file: File
): Promise<Record<'0.3um' | '0.5um' | '5.0um', Series[]>> {
	const text = await file.text();
	const rows = parseCsv(text);

	const headerIdx = findHeaderIndex(rows);
	if (headerIdx < 0) throw new Error('CSV 헤더(Record/Mode/Location) 미검출');
	const header = rows[headerIdx];
	const dataRows = rows.slice(headerIdx + 1);

	const { idxLocation, idxCh1, idxCh2, idxCh3 } = resolveIndexes(header);

	// Location 원문 기준 그룹핑
	type Acc = Record<string, { ch1: number[]; ch2: number[]; ch3: number[] }>;
	const acc: Acc = {};

	for (const r of dataRows) {
		// 열 길이 체크 (마지막 빈 컬럼 포함 가능)
		if (r.length <= Math.max(idxLocation, idxCh1, idxCh2, idxCh3)) continue;

		const key = String(r[idxLocation] ?? '').trim(); // 🔒 원문 그대로
		if (!key) continue;

		const ch1 = toNum(r[idxCh1]);
		const ch2 = toNum(r[idxCh2]);
		const ch3 = toNum(r[idxCh3]);

		if (!acc[key]) acc[key] = { ch1: [], ch2: [], ch3: [] };
		if (Number.isFinite(ch1)) acc[key].ch1.push(ch1);
		if (Number.isFinite(ch2)) acc[key].ch2.push(ch2);
		if (Number.isFinite(ch3)) acc[key].ch3.push(ch3);
	}

	// 정렬: 숫자 있으면 숫자 기준
	const sortKey = (k: string) => {
		const m = k.match(/\d+/);
		return m ? parseInt(m[0], 10) : Number.POSITIVE_INFINITY;
	};
	const locations = Object.keys(acc).sort((a, b) => sortKey(a) - sortKey(b));

	const avg = (arr: number[]) =>
		arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
	const label = (k: string) => {
		const m = k.match(/\d+/);
		return m ? `position${parseInt(m[0], 10)}` : `position-${k}`;
	};

	const toSeries = (k: 'ch1' | 'ch2' | 'ch3'): Series[] =>
		locations.map((loc) => ({
			label: label(loc),
			value: Number(avg(acc[loc][k]).toFixed(2)),
		}));

	return {
		'0.3um': toSeries('ch1'),
		'0.5um': toSeries('ch2'),
		'5.0um': toSeries('ch3'),
	};
}

export async function buildVocData(file: File): Promise<Series[]> {
	const text = await file.text();
	const lines = text
		.split(/\r?\n/)
		.map((l) => l.trim())
		.filter(Boolean);

	const headerIdx = lines.findIndex((l) =>
		l.toLowerCase().startsWith('date,time,isobutylene')
	);
	if (headerIdx < 0) throw new Error('Isobutylene 헤더를 찾지 못했습니다.');

	const values: number[] = [];
	for (const row of lines.slice(headerIdx + 1)) {
		const parts = row.split(',');
		if (parts.length < 3) continue;

		const raw = (parts[2] ?? '').trim();
		const v = Number(raw);

		// ✅ 숫자만 추가
		if (raw !== '' && !Number.isNaN(v)) {
			values.push(v);
		}
	}

	const avg =
		values.length > 0
			? values.reduce((s, v) => s + v, 0) / values.length
			: 0;

	return [{ label: 'Isobutylene', value: Number(avg.toFixed(2)) }];
}

// 평균 계산
function mean(arr: number[]): number {
  const valid = arr.filter((v) => !Number.isNaN(v));
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
}

// txt 파싱 → BarChart data
export async function buildAqmData(file: File): Promise<Series[]> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).map((l) => l.trim());

  let headers: string[] = [];
  const data: string[][] = [];

  for (const line of lines) {
    if (!line) continue;
    if (line.startsWith("Current/Time")) {
      headers = line.split("\t").map((h) => h.trim());
      continue;
    }
    if (/^\d{2}\/\d{2}\/\d{2}/.test(line)) {
      const parts = line.split("\t").map((p) => p.trim());
      data.push(parts);
    }
  }

  const valuesByField: Record<string, number[]> = {};
  data.forEach((row) => {
    headers.forEach((h, i) => {
      if (i === 0) return; // 시간 제외
      const v = parseFloat(row[i]);
      if (!valuesByField[h]) valuesByField[h] = [];
      if (!isNaN(v)) valuesByField[h].push(v);
    });
  });

  // BarChart용 데이터: label = 항목, value = 평균값
  return Object.entries(valuesByField).map(([field, arr]) => ({
    label: field,
    value: Number(mean(arr).toFixed(2)),
  }));
}

// 라벨에서 단위를 추론해 "°C", "ppm", "ppb", "mbar", "%", "µg/m³" 등 반환
export function detectUnit(label: string): string {
  const s = (label ?? "").trim();

  // 가장 명시적인 케이스 우선
  if (/[µu]g\/m3/i.test(s)) return "µg/m³";   // "µg/m3", "ug/m3" 모두 처리
  if (/\bppb\b/i.test(s))   return "ppb";
  if (/\bppm\b/i.test(s))   return "ppm";
  if (/\bmbar\b/i.test(s))  return "mbar";
  if (/%/.test(s))          return "%";

  // 온도: "(C)" 또는 "°C"가 들어 있으면
  if (/\(c\)|°c/i.test(s))  return "°C";

  // 필드명 힌트(단위 표기가 없더라도 일반적으로 쓰는 단위 추론)
  const lc = s.toLowerCase();
  if (/\bco2\b/.test(lc))   return "ppm";
  if (/\bco\b/.test(lc))    return "ppm";
  if (/\bno\b/.test(lc))    return "ppm";
  if (/\bso2\b/.test(lc))   return "ppm";
  if (/\bo3\b/.test(lc))    return "ppb";
  if (/\bfmh\b/.test(lc))   return "ppb";
  if (/\bbp\b/.test(lc))    return "mbar";
  if (/\brh\b/.test(lc))    return "%";
  if (/\bt\s*ambient\b|\bdpt\b|\bwbt\b/.test(lc)) return "°C";

  // 기본값
  return "";
}
