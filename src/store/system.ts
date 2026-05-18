import { create } from 'zustand';

type SystemState = {
  // time pause / time resume
  timePaused: boolean;

  // set background meadow | forest | ...
  background: string;

  // theme dark | theme light
  theme: 'light' | 'dark';

  // cursor crosshair | cursor default | ...
  cursor: string;

  // music <song> | mute
  track: string | null;
  muted: boolean;

  // login | sudo
  role: 'guest' | 'admin';

  // block ip — blocklist는 서버(Supabase)에서 읽어옴, 로컬 캐시만 보관
  blocklist: string[];

  // actions
  setTimePaused: (v: boolean) => void;
  setBackground: (v: string) => void;
  setTheme: (v: 'light' | 'dark') => void;
  setCursor: (v: string) => void;
  setTrack: (v: string | null) => void;
  setMuted: (v: boolean) => void;
  setRole: (v: 'guest' | 'admin') => void;
  setBlocklist: (v: string[]) => void;
};

export const useSystemStore = create<SystemState>((set) => ({
  timePaused: false,
  background: 'default',
  theme: 'light',
  cursor: 'default',
  track: null,
  muted: false,
  role: 'guest',
  blocklist: [],

  setTimePaused: (v) => set({ timePaused: v }),
  setBackground: (v) => set({ background: v }),
  setTheme: (v) => set({ theme: v }),
  setCursor: (v) => set({ cursor: v }),
  setTrack: (v) => set({ track: v }),
  setMuted: (v) => set({ muted: v }),
  setRole: (v) => set({ role: v }),
  setBlocklist: (v) => set({ blocklist: v }),
}));
