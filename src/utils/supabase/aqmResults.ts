import { supabaseClient } from '@/lib/supabase/client';
import { fetchManagementRecordById, ManagementRecords_BUCKET } from './managementRecord';
import { downloadAsFile, removeFile, uploadFileToPath } from './storage';
import { MicrobioAnalysisType } from '@/src/pages/admin/managementRecords/edit/aqm';
import { sanitizeFileName } from '../string';

export interface AQMResultRow {
	id: string;
	management_record_id: string;
	pm_file_path: string | null;
	voc_file_path: string | null;
	aqm_file_path: string | null;
	microbio_file_path: string | null;
	microbio_analysis: MicrobioAnalysisType | null;
}

export interface upsertAqmResultProps {
	recordId: string;
	companyId: string;
	microbioAnal?: MicrobioAnalysisType;
	microbioFile?: File | null;
	pmFile?: File | null;
	vocFile?: File | null;
	aqmFile?: File | null;
}

export function buildManagementFilePath(
	companyId: string,
	recordId: string,
	kind: 'microbio' | 'pm' | 'voc' | 'aqm',
	filename: string
) {
	return `${companyId}/${recordId}/${kind}/${sanitizeFileName(filename)}`;
}

/** aqm_results 업서트 + 파일 교체 처리 */
export async function upsertAqmResult(props: upsertAqmResultProps) {
	const supabase = supabaseClient();
	const existing = await fetchAqmResultByRecordId(props.recordId);

	// 1) 없으면 빈 레코드 먼저 생성
	let base: AQMResultRow;
	if (!existing) {
		const { data: created, error: cErr } = await supabase
			.from('aqm_results')
			.insert({
				management_record_id: props.recordId,
				microbio_analysis: props.microbioAnal ?? null,
			})
			.select('*')
			.single();
		if (cErr) throw cErr;
		base = created as AQMResultRow;
	} else {
		base = existing;
	}

	// 2) 파일 교체 업로드(새 파일 있으면 이전 삭제 후 업로드)
	let microbioPath = base.microbio_file_path ?? null;
	if (microbioPath) {
		await removeFile(microbioPath, ManagementRecords_BUCKET);
	}
	if (props.microbioFile) {
		const p = buildManagementFilePath(
			props.companyId,
			props.recordId,
			'microbio',
			props.microbioFile.name
		);
		microbioPath = await uploadFileToPath(
			p,
			props.microbioFile,
			ManagementRecords_BUCKET
		);
	}

	let pmPath = base.pm_file_path ?? null;
	if (pmPath) {
		await removeFile(pmPath, ManagementRecords_BUCKET);
	}
	if (props.pmFile) {
		const p = buildManagementFilePath(
			props.companyId,
			props.recordId,
			'pm',
			props.pmFile.name
		);
		pmPath = await uploadFileToPath(
			p,
			props.pmFile,
			ManagementRecords_BUCKET
		);
	}

	let vocPath = base.voc_file_path ?? null;
	if (vocPath) {
		await removeFile(vocPath, ManagementRecords_BUCKET);
	}
	if (props.vocFile) {
		const p = buildManagementFilePath(
			props.companyId,
			props.recordId,
			'voc',
			props.vocFile.name
		);
		vocPath = await uploadFileToPath(
			p,
			props.vocFile,
			ManagementRecords_BUCKET
		);
	}

	let aqmPath = base.aqm_file_path ?? null;
	if (aqmPath) {
		await removeFile(aqmPath, ManagementRecords_BUCKET);
	}
	if (props.aqmFile) {
		const p = buildManagementFilePath(
			props.companyId,
			props.recordId,
			'aqm',
			props.aqmFile.name
		);
		aqmPath = await uploadFileToPath(
			p,
			props.aqmFile,
			ManagementRecords_BUCKET
		);
	}

	// 3) DB 업데이트
	const { data: updated, error: uErr } = await supabase
		.from('aqm_results')
		.update({
			microbio_file_path: microbioPath,
			pm_file_path: pmPath,
			voc_file_path: vocPath,
			aqm_file_path: aqmPath,
			microbio_analysis:
				props.microbioAnal ?? base.microbio_analysis ?? null,
		})
		.eq('id', base.id)
		.select('*')
		.single();

	if (uErr) throw uErr;
	return updated as AQMResultRow;
}

export async function fetchAqmResultByRecordId(recordId: string) {
	const supabase = supabaseClient();
	const { data, error } = await supabase
		.from('aqm_results')
		.select('*')
		.eq('management_record_id', recordId)
		.maybeSingle(); // 결과가 없을 수도 있으므로 maybeSingle

	if (error) throw error;
	return data;
}

/** 관리 레코드 + 결과를 함께 로드, 파일은 File 객체로 복구 */
export async function loadAqmBundleAsFiles(recordId: string) {
  const [record, result] = await Promise.all([
    fetchManagementRecordById(recordId),
    (async () => {
      const { data, error } = await supabaseClient()
        .from('aqm_results')
        .select('*')
        .eq('management_record_id', recordId)
        .maybeSingle();
      if (error) throw error;
      return data as (AQMResultRow | null);
    })(),
  ]);

  let microbioFile: File|null = null;
  let pmFile: File|null = null;
  let vocFile: File|null = null;
  let aqmFile: File|null = null;

  if (result?.microbio_file_path) microbioFile = await downloadAsFile(result.microbio_file_path, ManagementRecords_BUCKET);
  if (result?.pm_file_path) pmFile = await downloadAsFile(result.pm_file_path, ManagementRecords_BUCKET);
  if (result?.voc_file_path) vocFile = await downloadAsFile(result.voc_file_path, ManagementRecords_BUCKET);
  if (result?.aqm_file_path) aqmFile = await downloadAsFile(result.aqm_file_path, ManagementRecords_BUCKET);

  return { record, result, files: { microbioFile, pmFile, vocFile, aqmFile } };
}