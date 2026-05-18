import { create } from 'zustand';

type SystemState = {
  timeScale: number;
  theme: 'default' | 'dark';
  user: { role: 'guest' | 'admin'; name?: string };
  setTimeScale: (v: number) => void;
  setTheme: (v: 'default' | 'dark') => void;
  setUser: (u: SystemState['user']) => void;
};

export const useSystemStore = create<SystemState>((set) => ({
  timeScale: 1,
  theme: 'default',
  user: { role: 'guest' },
  setTimeScale: (v) => set({ timeScale: v }),
  setTheme: (v) => set({ theme: v }),
  setUser: (u) => set({ user: u }),
}));
