import type { CommandHandler } from '../registry';

export const whoami: CommandHandler = () => ({
  type: 'text',
  content: 'visitor',
});
