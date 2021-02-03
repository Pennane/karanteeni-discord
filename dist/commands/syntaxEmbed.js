"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = __importDefault(require("discord.js"));
const configuration = require('../util/config');
const prefix = configuration.PREFIX;
const syntaxEmbed = ({ configuration, heading, body }) => {
    const embed = new discord_js_1.default.MessageEmbed();
    embed.setColor('#FF0000');
    if (!configuration)
        throw new Error('No configuration to search syntax for.');
    if (!configuration.syntax)
        throw new Error('configuration did not include command syntax.');
    if (!configuration.name)
        throw new Error('configuration did not include a name for the commmand.');
    embed.title = heading || `Komento ${configuration.name} toimii näin:`;
    embed.description = body || `\`${prefix}${configuration.syntax}\``;
    if (configuration.triggers.length > 1) {
        embed.addField(`Vaihtoehtoiset nimet komennolle`, configuration.triggers.join(' '));
    }
    return embed;
};
exports.default = syntaxEmbed;
