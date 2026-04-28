import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  token: string;
  currentUser: User | null;
  setSession: (token: string, user: User) => void;
  clearSession: () => void;
}

function readStoredUser(): User | null {
  const raw = localStorage.getItem('auth_user');
  return raw ? (JSON.parse(raw) as User) : null;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('auth_token') || '',
  currentUser: readStoredUser(),
  setSession: (token: string, user: User) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ token, currentUser: user });
  },
  clearSession: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({ token: '', currentUser: null });
  }
}));
