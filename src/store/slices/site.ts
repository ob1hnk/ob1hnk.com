import { create } from 'zustand';

interface SiteState {
  timeScale: number;
  theme: 'dark' | 'light';
  cursor: string;
  background: string;
  track: string | null;
  muted: boolean;
  role: 'guest' | 'admin';
  blocklist: string[];
  setTimeScale: (v: number) => void;
  setTheme: (t: 'dark' | 'light') => void;
  setCursor: (c: string) => void;
  setBackground: (v: string) => void;
  setTrack: (v: string | null) => void;
  setMuted: (v: boolean) => void;
  setRole: (v: 'guest' | 'admin') => void;
  setBlocklist: (v: string[]) => void;
}

export const useSiteStore = create<SiteState>((set) => ({
  timeScale: 1,
  theme: 'light',
  cursor: 'default',
  background: 'default',
  track: null,
  muted: false,
  role: 'guest',
  blocklist: [],
  setTimeScale: (v) => set({ timeScale: v }),
  setTheme: (t) => set({ theme: t }),
  setCursor: (c) => set({ cursor: c }),
  setBackground: (v) => set({ background: v }),
  setTrack: (v) => set({ track: v }),
  setMuted: (v) => set({ muted: v }),
  setRole: (v) => set({ role: v }),
  setBlocklist: (v) => set({ blocklist: v }),
}));
