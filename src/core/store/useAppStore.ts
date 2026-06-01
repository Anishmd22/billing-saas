import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppSettings {
  // Company / supplier info
  companyName: string;
  companyAddress: string;
  companyGST: string;
  companyPhone: string;
  companyEmail: string;
  supplierState: string;

  // Invoice settings
  invoicePrefix: string;
  dueDays: number;
  termsAndConditions: string;

  // Bank details (for PDF footer)
  bankName: string;
  bankAccount: string;
  bankIFSC: string;
}

interface AppStore {
  settings: AppSettings;
  setSettings: (settings: Partial<AppSettings>) => void;

  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

const defaultSettings: AppSettings = {
  companyName: '',
  companyAddress: '',
  companyGST: '',
  companyPhone: '',
  companyEmail: '',
  supplierState: process.env.NEXT_PUBLIC_SUPPLIER_STATE ?? 'Tamil Nadu',
  invoicePrefix: process.env.NEXT_PUBLIC_DEFAULT_INVOICE_PREFIX ?? 'INV-',
  dueDays: parseInt(process.env.NEXT_PUBLIC_DEFAULT_DUE_DAYS ?? '30', 10),
  termsAndConditions: '',
  bankName: '',
  bankAccount: '',
  bankIFSC: '',
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      setSettings: (newSettings) =>
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'smart-billing-settings',
      partialize: (state: AppStore) => ({ settings: state.settings }),
    }
  )
);
