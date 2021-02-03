"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecialMessages = void 0;
const config_1 = __importDefault(require("../util/config"));
const loader_1 = __importDefault(require("../commands/loader"));
const events_1 = require("events");
const { commands, triggers } = loader_1.default();
const prefix = config_1.default.PREFIX;
exports.SpecialMessages = new events_1.EventEmitter();
const handler = {
    parse: (message, client) => {
        if (message.channel.id === config_1.default.DISCORD.ID_MAP.CHANNELS.COUNT_UP_GAME) {
            exports.SpecialMessages.emit('countingGameMessage', message);
            return;
        }
        let hasPrefix = message.content.startsWith(prefix);
        if (!hasPrefix && message.content.includes('bad bot')) {
            message.channel.send('no u');
            return;
        }
        if (!hasPrefix && message.content.includes('good bot')) {
            message.channel.send('ty');
            return;
        }
        if (!hasPrefix)
            return;
        let args = message.content.trim().substr(prefix.length).split(' ');
        let trigger = args[0].toLowerCase();
        if (!triggers.hasOwnProperty(trigger))
            return;
        let command = commands.get(triggers[trigger]);
        command.execute(message, client, args);
        return;
    }
};
exports.default = handler;
