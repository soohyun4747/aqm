import { create } from 'zustand';

export const userTypes = {
	company: 'company',
	admin: 'admin',
} as const;

export type UserType = (typeof userTypes)[keyof typeof userTypes];

interface UserStore {
	user: User | undefined;
	setUser: (value: User | undefined) => void;
}

export interface User {
	id: string;
	userType: UserType;
	company: Company | null;
}

export interface Company {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  floorImagePath?: string;
}

export const useUserStore = create<UserStore>((set) => {
	return {
		user: undefined,
		setUser: (value) => set(() => ({ user: value })),
	};
});
