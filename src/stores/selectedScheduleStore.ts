import { create } from 'zustand';
import { ISchedule } from '../components/calendar/ScheduleCard';

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
