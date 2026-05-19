import { useSiteStore } from '../../store';
import type { CommandHandler } from '../registry';

export const theme: CommandHandler = (args) => {
  const t = args[0];
  if (t !== 'dark' && t !== 'light') {
    return { type: 'error', content: 'usage: theme dark | theme light' };
  }
  useSiteStore.getState().setTheme(t);
  return { type: 'text', content: `theme changed to ${t}` };
};
