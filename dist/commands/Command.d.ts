import Discord from 'discord.js';
export declare type CommandExecutor = (message: Discord.Message, client: Discord.Client | undefined, args: Array<string>) => Promise<void>;
interface CommandConfiguration {
    name: string;
    syntax: string;
    desc: string;
    triggers: Array<string>;
    type: Array<string>;
    admin?: boolean;
    superAdmin?: boolean;
    hidden?: boolean;
    requireGuild: boolean;
}
interface CommandInitializer {
    configuration: CommandConfiguration;
    executor: (message: Discord.Message, client: Discord.Client | undefined, args: Array<string>) => Promise<void>;
}
declare class Command {
    type: Array<string>;
    hidden: boolean | undefined;
    description: string;
    syntax: string;
    name: string;
    triggers: Array<string>;
    adminCommand: boolean | undefined;
    superAdminCommand: boolean | undefined;
    requireGuild: boolean;
    executor: CommandExecutor;
    constructor(initializer: CommandInitializer);
    static commandVariants(): {
        name: string;
        description: string;
        emoji: string;
    }[];
    static isMemberAdminAuthorized(message: Discord.Message, client: Discord.Client): boolean;
    static createEmbed(): Discord.MessageEmbed;
    unauthorizedAction(message: Discord.Message): void;
    execute(message: Discord.Message, client: Discord.Client | undefined, args: Array<string>): void;
}
export default Command;
