import type { CommandHandler } from '../registry';

export const time: CommandHandler = () => ({
  type: 'text',
  content: new Date().toLocaleString(), // uses visitor's browser locale automatically
});
