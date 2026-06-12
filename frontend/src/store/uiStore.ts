import { create } from 'zustand';

interface UIState {
  authModalOpen: boolean;
  authMode: 'login' | 'register';
  openAuth: (mode: 'login' | 'register') => void;
  closeAuth: () => void;
  switchAuthMode: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  authModalOpen: false,
  authMode: 'login',
  openAuth: (mode) => set({ authModalOpen: true, authMode: mode }),
  closeAuth: () => set({ authModalOpen: false }),
  switchAuthMode: () =>
    set({ authMode: get().authMode === 'login' ? 'register' : 'login' }),
}));
