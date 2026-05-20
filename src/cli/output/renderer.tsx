/**
 * Terminal colour palette and the Line renderer.
 *
 * C — all colours used by the terminal UI, defined once here so CLIWindow
 *     and Line stay in sync without prop-drilling.
 *
 * Line — renders a single OutputLine based on its type:
 *   text      plain output (white)
 *   error     shown in red
 *   ascii     pre-formatted (cowsay etc.) — uses <pre> to preserve spacing
 *   table     not yet implemented
 *   component arbitrary React node (for future rich output)
 *   ''        empty content renders as a short vertical gap
 */

import type { OutputLine } from './types';

export const C = {
  bg:      '#000000',
  text:    '#f2f2f2', // primary output — white
  dim:     'rgba(242,242,242,0.4)',
  prompt:  'rgba(242,242,242,0.6)', // the $ prompt and echoed commands
  error:   '#ff5f5f',
  titleBg: '#1a1a1a',
  border:  '#333333',
  cursor:  '#f2f2f2',
} as const;

export function Line({ line }: { line: OutputLine }) {
  if (line.type === 'ascii') {
    return <pre style={{ color: C.text, lineHeight: 1.3, margin: 0 }}>{line.content}</pre>;
  }
  if (line.content === '') {
    return <div style={{ height: '0.4rem' }} />; // blank spacer between commands
  }
  const isPrompt = line.type === 'text' && line.content.startsWith('$ ');
  return (
    <div style={{ color: line.type === 'error' ? C.error : isPrompt ? C.prompt : C.text }}>
      {line.content}
    </div>
  );
}
