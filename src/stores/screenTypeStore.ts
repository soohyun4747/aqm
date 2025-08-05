import { create } from 'zustand';

export const screenTypes = {
	mobile: 'mobile',
	pc: 'pc',
} as const;

export type ScreenType = (typeof screenTypes)[keyof typeof screenTypes];

interface ScreenTypeStore {
	screenType: ScreenType;
	setScreenType: (value: ScreenType) => void;
}

export const useScreenTypeStore = create<ScreenTypeStore>((set) => {
	return {
		screenType: screenTypes.pc,
		setScreenType: (value) => set(() => ({ screenType: value })),
	};
});
