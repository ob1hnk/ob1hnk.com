import { create } from 'zustand';
import type { OutputLine } from '../../cli/output/types';

interface CLIState {
  isOpen: boolean;
  position: { x: number; y: number };
  size: { w: number; h: number };
  inputHistory: string[];
  historyIndex: number;
  outputLines: OutputLine[];
  toggle: () => void;
  open: () => void;
  close: () => void;
  setPosition: (pos: { x: number; y: number }) => void;
  appendOutput: (line: OutputLine) => void;
  clearOutput: () => void;
  pushHistory: (cmd: string) => void;
}

export const useCLIStore = create<CLIState>((set) => ({
  isOpen: false,
  position: { x: 0, y: 0 },
  size: { w: 600, h: 400 },
  inputHistory: [],
  historyIndex: -1,
  outputLines: [],
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setPosition: (pos) => set({ position: pos }),
  appendOutput: (line) => set((s) => ({ outputLines: [...s.outputLines, line] })),
  clearOutput: () => set({ outputLines: [] }),
  pushHistory: (cmd) => set((s) => ({
    inputHistory: [cmd, ...s.inputHistory],
    historyIndex: -1,
  })),
}));
