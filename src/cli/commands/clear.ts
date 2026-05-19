import { useCLIStore } from '../../store';
import type { CommandHandler } from '../registry';

export const clear: CommandHandler = () => {
  useCLIStore.getState().clearOutput();
};
