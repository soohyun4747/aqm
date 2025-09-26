type Range = { start: number; end: number }; // end는 '제외' 구간

export function parseStandard(standard: string, maxValue: number): Range {
  const s = standard.trim();

  // "> 100" -> [100, maxValue)
  if (s.startsWith('>')) {
    const min = Math.max(0, parseFloat(s.replace('>', '').trim()) || 0);
    return { start: Math.min(min, maxValue), end: maxValue };
  }

  // "a-b" -> [a, min(b, maxValue))  (상한 '제외')
  const m = s.match(/(\d+)\s*-\s*(\d+)/);
  if (m) {
    let a = parseFloat(m[1]);
    let b = parseFloat(m[2]);
    a = Math.max(0, Math.min(a, maxValue));
    b = Math.max(0, Math.min(b, maxValue));
    // 상한 제외 처리
    return { start: Math.min(a, b), end: Math.max(a, b) };
  }

  // 파싱 실패 시 0길이
  return { start: 0, end: 0 };
}

export function getStandardPercents(
  safeStandard: string,
  warningStandard: string,
  dangerStandard: string,
  maxValue: number
) {
  const safeR = parseStandard(safeStandard, maxValue);
  const warnR = parseStandard(warningStandard, maxValue);
  const dangR = parseStandard(dangerStandard, maxValue);

  // 각 구간 길이(음수/겹침 방지는 길이만 사용)
  const lenSafe = Math.max(0, safeR.end - safeR.start);
  const lenWarn = Math.max(0, warnR.end - warnR.start);
  const lenDang = Math.max(0, dangR.end - dangR.start);

  let pSafe = 0, pWarn = 0, pDang = 0;

  // 1) maxValue 기준 비율(상한 제외)
  const pctSafeRaw = (lenSafe / maxValue) * 100;
  const pctWarnRaw = (lenWarn / maxValue) * 100;
  const pctDangRaw = (lenDang / maxValue) * 100;

  const sumRaw = pctSafeRaw + pctWarnRaw + pctDangRaw;

  if (sumRaw > 0) {
    // 2) 정규화해서 합이 정확히 100%가 되도록
    const k = 100 / sumRaw;
    pSafe = pctSafeRaw * k;
    pWarn = pctWarnRaw * k;
    // 마지막은 보정(부동소수점 오차 제거)
    pDang = Math.max(0, 100 - pSafe - pWarn);
  } else {
    // 전부 0이면 danger 100%로
    pDang = 100;
  }

  return { pSafe, pWarn, pDang };
}