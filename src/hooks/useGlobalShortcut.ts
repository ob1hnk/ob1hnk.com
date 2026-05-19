import { useEffect } from 'react';
import { useCLIStore } from '../store';

export function useGlobalShortcut() {
  const toggle = useCLIStore((s) => s.toggle);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== '`') return;
      const inInput = ['INPUT', 'TEXTAREA'].includes(
        (e.target as HTMLElement).tagName,
      );
      // Ctrl+` always toggles; bare backtick only when not in an input
      if (e.ctrlKey || !inInput) {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle]);
}
