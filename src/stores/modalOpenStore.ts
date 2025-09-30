import { create } from 'zustand';

interface ModalOpenStore {
    open: boolean;
    setOpen: (value: boolean) => void;
}

export const useScheduleEditModalOpenStore = create<ModalOpenStore>((set) => {
    return {
        open: false,
        setOpen: (value) => set(() => ({ open: value })),
    };
});


export const useScheduleDetailModalOpenStore = create<ModalOpenStore>((set) => {
    return {
        open: false,
        setOpen: (value) => set(() => ({ open: value })),
    };
});


export const useScheduleDeleteModalOpenStore = create<ModalOpenStore>((set) => {
    return {
        open: false,
        setOpen: (value) => set(() => ({ open: value })),
    };
});


export const useScheduleAddModalOpenStore = create<ModalOpenStore>((set) => {
    return {
        open: false,
        setOpen: (value) => set(() => ({ open: value })),
    };
});