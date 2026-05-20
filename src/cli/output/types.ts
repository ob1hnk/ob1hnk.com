export type OutputLine =
  | { type: 'text';  content: string }
  | { type: 'error'; content: string }
  | { type: 'ascii'; content: string };
