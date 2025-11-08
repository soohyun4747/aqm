import { create } from 'zustand';

export const userTypes = {
	company: 'company',
	admin: 'admin',
} as const;

export type UserType = (typeof userTypes)[keyof typeof userTypes];

interface UserStore {
	user: IUser | undefined;
	setUser: (value: IUser | undefined) => void;
}

export interface IAdminContact {
        emails: string[];
        phones: string[];
}

export interface IUser {
        id: string;
        userType: UserType;
        company: ICompany | undefined;
        adminContact?: IAdminContact;
}

export interface ICompany {
  id: string;
  name: string;
  phone: string;
  kakaoPhones: string[]
  email: string;
  address: string;
  floorImagePath?: string;
}

export const useUserStore = create<UserStore>((set) => {
	return {
		user: undefined,
		setUser: (value) => set(() => ({ user: value })),
	};
});
