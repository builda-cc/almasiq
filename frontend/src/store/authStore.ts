import { create } from 'zustand';
import type { User } from '../types';
import { api, getStoredToken, setStoredToken } from '../utils/api';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  login: (token: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: getStoredToken(),
  user: null,
  isAuthenticated: false,
  isLoading: false,

  async initialize() {
    const token = getStoredToken();
    if (!token) return;
    set({ isLoading: true });
    try {
      const { data } = await api.get<User>('/auth/me');
      set({ token, user: data, isAuthenticated: true });
    } catch {
      setStoredToken(null);
      set({ token: null, user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  async login(token: string) {
    setStoredToken(token);
    set({ token, isLoading: true });
    try {
      const { data } = await api.get<User>('/auth/me');
      set({ user: data, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  logout() {
    setStoredToken(null);
    set({ token: null, user: null, isAuthenticated: false });
    void get();
  },

  setUser(user: User) {
    set({ user });
  },
}));
