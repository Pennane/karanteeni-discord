import Discord from 'discord.js';
declare function update(guild: Discord.Guild): Promise<void>;
declare const status: {
    update: typeof update;
    cached: () => any;
};
export default status;
