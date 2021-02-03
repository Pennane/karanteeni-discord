/// <reference types="node" />
import { EventEmitter } from 'events';
import Discord from 'discord.js';
export declare const SpecialMessages: EventEmitter;
declare const handler: {
    parse: (message: Discord.Message, client: Discord.Client) => void;
};
export default handler;
