import { create } from 'zustand';

interface LoadingState {
	isOpen: boolean;
	open: () => void;
	close: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
	isOpen: false,
	open: () => set({ isOpen: true }),
	close: () => set({ isOpen: false }),
}));
