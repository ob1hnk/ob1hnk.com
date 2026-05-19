import type { ReactNode } from 'react';

export type OutputLine =
  | { type: 'text';      content: string }
  | { type: 'error';     content: string }
  | { type: 'table';     content: Record<string, string>[] }
  | { type: 'ascii';     content: string }
  | { type: 'component'; content: ReactNode };
