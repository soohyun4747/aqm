import { MicrobioAnalysisType } from "../pages/admin/managementRecords/edit/aqm/[id]";

export function StatusLabel({ status }: { status: MicrobioAnalysisType }) {
	return (
		<div
			className={`flex items-center justify-center w-[64px] p-1 rounded-[8px] border ${
				status === 'pass'
					? 'border-Primary-700 bg-Primary-50'
					: 'border-Red-700 bg-Red-50'
			}`}>
			<p
				className={`${
					status === 'pass' ? 'text-Primary-700' : 'text-Red-700'
				} body-md-medium`}>
				{status.toLocaleUpperCase()}
			</p>
		</div>
	);
}
