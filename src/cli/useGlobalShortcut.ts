import { useEffect } from 'react';
import { useCLIStore } from '../store';

export function useGlobalShortcut() {
  const toggle = useCLIStore((s) => s.toggle);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== '`') return;
      const target = e.target as HTMLElement;
      const inInput     = ['INPUT', 'TEXTAREA'].includes(target.tagName);
      const inCLIInput  = target.closest('[data-cli-input]') !== null;
      // Ctrl+` always toggles; bare backtick only outside of any input
      if (e.ctrlKey || (!inInput && !inCLIInput)) {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle]);
}
