import Discord from 'discord.js';
export declare const pushHighestAchievedNumber: (value: number, destination: Discord.TextChannel) => void;
export declare const notifyFromAchievement: (achievementMessage: string, destination: Discord.TextChannel) => Promise<void>;
export declare const findAchievement: (int: number) => [(current: number) => boolean, (current: number, message: Discord.Message) => string] | undefined;
export declare const findAndGiveAchievements: (int: number, message: Discord.Message, destination: Discord.TextChannel) => Promise<void>;
export declare const sendResetMessage: (destination: Discord.TextChannel, member: Discord.GuildMember, customMessage?: string | null | undefined) => void;
export declare const sendCountingStartsAtOne: (destination: Discord.TextChannel, oldMessage: Discord.Message) => void;
