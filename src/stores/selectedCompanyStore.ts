import { create } from 'zustand';
import { ICompany } from './userStore';

interface SelectedCompanyStore {
	company: ICompany | undefined;
	setCompany: (value: ICompany | undefined) => void;
}

export const useSelectedCompanyStore = create<SelectedCompanyStore>((set) => {
    return {
        company: undefined,
        setCompany: (value) => set(() => ({company: value}))
    }
});
