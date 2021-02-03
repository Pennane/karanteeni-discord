import Discord from 'discord.js';
declare const countingGame: {
    current: () => number;
    cachedInteger: () => number | undefined;
    highestAchievedInteger: () => number | undefined;
    initializeGame: (client: Discord.Client) => Promise<void>;
    parseCountingGameMessageEdit: (oldMessage: Discord.Message, newMessage: Discord.Message) => void;
    parseCountingGameMessageDelete: (message: Discord.Message) => void;
};
export default countingGame;
