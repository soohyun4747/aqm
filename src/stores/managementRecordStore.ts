import { create } from 'zustand';
import { IManagementRecord } from '../pages/admin/managementRecords';

interface ManagementRecordStore {
	managementRecord: IManagementRecord | undefined;
	setManagementRecord: (value: IManagementRecord | undefined) => void;
}

export const useManagementRecordStore = create<ManagementRecordStore>((set) => {
	return {
		managementRecord: undefined,
		setManagementRecord: (value) =>
			set(() => ({ managementRecord: value })),
	};
});
