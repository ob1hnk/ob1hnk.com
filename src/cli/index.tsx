/**
 * CLIWindow — the floating terminal window.
 *
 * Architecture notes:
 * - Uses a focusable <div> (not <input>) as the typing surface so we can render
 *   a real block cursor via a styled <span>. A plain <input> only supports a
 *   thin caret and can't be customised into a block.
 * - data-cli-input attribute tells useGlobalShortcut not to toggle the window
 *   when the user types a backtick inside the terminal.
 * - Drag is restricted to the title bar via Framer Motion's useDragControls
 *   (dragListener=false on the root + dragControls.start on the title bar).
 */

import { useRef, useState, useEffect, type KeyboardEvent } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { useCLIStore } from '../store';
import { parse } from './parser';
import { registry } from './registry';
import { getCompletions, applyCompletion } from './completion';
import { C, Line } from './output/renderer';

export function CLIWindow() {
  const { isOpen, outputLines, inputHistory, appendOutput, pushHistory, close } =
    useCLIStore();

  // Local UI state — not in the global store because it only matters while the window is open
  const [input, setInput]       = useState('');
  const [histIdx, setHistIdx]   = useState(-1);   // position in inputHistory for ↑↓ navigation
  const [tabComps, setTabComps] = useState<string[]>([]); // current tab completion candidates
  const [tabIdx, setTabIdx]     = useState(-1);    // which candidate is selected

  const bodyRef    = useRef<HTMLDivElement>(null); // the focusable terminal body
  const bottomRef  = useRef<HTMLDivElement>(null); // invisible sentinel used to scroll-to-bottom
  const dragControls = useDragControls();

  // Focus the terminal body whenever the window opens
  useEffect(() => { if (isOpen) bodyRef.current?.focus(); }, [isOpen]);

  // Keep the prompt visible as output grows
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'nearest' });
  }, [outputLines.length, tabComps.length]);

  if (!isOpen) return null;

  // ─── Submit ────────────────────────────────────────────────────────────────
  const submit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    pushHistory(trimmed);
    setInput(''); setHistIdx(-1); setTabComps([]); setTabIdx(-1);

    const { cmd, args, flags } = parse(trimmed);

    // Add a blank spacer before each echo so successive commands are visually separated
    if (useCLIStore.getState().outputLines.length > 0)
      appendOutput({ type: 'text', content: '' });
    appendOutput({ type: 'text', content: `$ ${trimmed}` });

    const handler = registry[cmd];
    if (!handler) {
      appendOutput({ type: 'error', content: `command not found: ${cmd}` });
      return;
    }

    // Commands return one OutputLine, an array, or void (for side-effect-only commands like clear)
    const result = handler(args, flags);
    if (!result) return;
    (Array.isArray(result) ? result : [result]).forEach((l) => appendOutput(l));
  };

  // ─── Keyboard handler ──────────────────────────────────────────────────────
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Tab — show/cycle completions
    if (e.key === 'Tab') {
      e.preventDefault();
      if (tabComps.length === 0) {
        // First Tab: compute candidates
        const comps = getCompletions(input);
        if (comps.length === 1) {
          setInput(applyCompletion(input, comps[0]));
        } else if (comps.length > 1) {
          setTabComps(comps);
          setTabIdx(0);
          setInput(applyCompletion(input, comps[0]));
        }
      } else {
        // Subsequent Tabs: cycle through candidates
        const next = (tabIdx + 1) % tabComps.length;
        setTabIdx(next);
        setInput(applyCompletion(input, tabComps[next]));
      }
      return;
    }

    // Any non-modifier key dismisses the completion list
    if (!['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) {
      setTabComps([]); setTabIdx(-1);
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      setInput((p) => p.slice(0, -1));
    } else if (e.key === 'ArrowUp') {
      // Walk backwards through command history
      e.preventDefault();
      const n = Math.min(histIdx + 1, inputHistory.length - 1);
      setHistIdx(n); setInput(inputHistory[n] ?? '');
    } else if (e.key === 'ArrowDown') {
      // Walk forwards; -1 means "back to empty prompt"
      e.preventDefault();
      const n = Math.max(histIdx - 1, -1);
      setHistIdx(n); setInput(n === -1 ? '' : (inputHistory[n] ?? ''));
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Append printable characters
      setInput((p) => p + e.key);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <motion.div
      drag dragControls={dragControls} dragListener={false} dragMomentum={false}
      className="fixed z-50 flex flex-col"
      style={{
        width: 640, height: 420, left: 40, top: 40,
        background: C.bg, border: `1px solid ${C.border}`,
        fontFamily: "'SF Mono', Monaco, 'Courier New', monospace",
        fontSize: 13, lineHeight: '1.55',
      }}
    >
      {/* Title bar — the only drag handle */}
      <div
        onPointerDown={(e) => dragControls.start(e)}
        className="flex items-center justify-between px-3 shrink-0 select-none cursor-grab active:cursor-grabbing"
        style={{ height: 28, background: C.titleBg, borderBottom: `1px solid ${C.border}` }}
      >
        <span style={{ color: C.dim }}>ob1hnk@terminal ~ $</span>
        <button
          onClick={close}
          style={{ color: C.dim, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.dim)}
        >[x]</button>
      </div>

      {/* Terminal body — focusable div receives all keystrokes */}
      <div
        ref={bodyRef} data-cli-input tabIndex={0} onKeyDown={onKeyDown}
        className="flex-1 overflow-y-auto p-3 outline-none"
        style={{ color: C.text, textAlign: 'left' }}
        onClick={() => bodyRef.current?.focus()}
      >
        {/* Past output */}
        {outputLines.map((line, i) => <Line key={i} line={line} />)}

        {/* Current prompt + block cursor */}
        <div style={{ marginTop: outputLines.length > 0 ? '0.5rem' : 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ color: C.prompt, marginRight: 6, userSelect: 'none' }}>$</span>
            <span style={{ whiteSpace: 'pre' }}>{input}</span>
            {/* Block cursor: static white rectangle, no blink */}
            <span style={{ display: 'inline-block', width: '0.55em', height: '1.1em', background: C.cursor, verticalAlign: 'text-bottom', marginLeft: 1 }} />
          </div>

          {/* Tab completions shown inline below the prompt */}
          {tabComps.length > 0 && (
            <div style={{ paddingLeft: 18, marginTop: 2 }}>
              {tabComps.map((c, i) => (
                <span key={c} style={{ marginRight: 16, color: i === tabIdx ? C.text : C.dim }}>
                  {i === tabIdx ? `[${c}]` : c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Invisible bottom anchor — scrollIntoView keeps the prompt visible */}
        <div ref={bottomRef} />
      </div>
    </motion.div>
  );
}
