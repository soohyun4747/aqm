import { create } from 'zustand';
import { ISchedule } from '../utils/supabase/schedule';

interface SelectedScheduleStore {
	schedule: ISchedule | undefined;
	setSchedule: (value: ISchedule | undefined) => void;
}

export const useSelectedScheduleStore = create<SelectedScheduleStore>((set) => {
	return {
		schedule: undefined,
		setSchedule: (value) => set(() => ({ schedule: value })),
	};
});
