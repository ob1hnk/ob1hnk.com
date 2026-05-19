import type { CommandHandler } from '../registry';

export const help: CommandHandler = () => ({
  type: 'text',
  content: 'commands: help  whoami  cowsay  clear  time  theme',
});
