import { Message } from 'discord.js';
declare type Achievement = [(current: number) => boolean, (current: number, message: Message) => string];
declare const achievements: Array<Achievement>;
export default achievements;
