import { create } from 'zustand';

interface RFP {
    _id: string;
    title: string;
    status: string;
    createdAt: string;
}

interface StoreState {
    rfps: RFP[];
    setRFPs: (rfps: RFP[]) => void;
    addRFP: (rfp: RFP) => void;
}

export const useStore = create<StoreState>((set) => ({
    rfps: [],
    setRFPs: (rfps) => set({ rfps }),
    addRFP: (rfp) => set((state) => ({ rfps: [rfp, ...state.rfps] })),
}));
