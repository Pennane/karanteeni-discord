"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = __importDefault(require("discord.js"));
const notifyRole = (notifyRequest) => {
    let { streamChange, role, destination } = notifyRequest;
    console.info(streamChange);
    let embed = new discord_js_1.default.MessageEmbed();
    let thumbnailUrl = streamChange.thumbnail;
    let streamUrl = `https://www.twitch.tv/${streamChange.user}`;
    if (thumbnailUrl) {
        thumbnailUrl = thumbnailUrl.replace('{width}', '1920');
        thumbnailUrl = thumbnailUrl.replace('{height}', '1080');
    }
    embed
        .setAuthor(streamChange.user, streamChange.profilePicture)
        .setColor('#fdf500')
        .setTitle(streamChange.title)
        .setImage(thumbnailUrl)
        .setURL(streamUrl)
        .setTimestamp()
        .setThumbnail(streamChange.profilePicture)
        .setFooter('Stream ilmoitus', 'https://i.imgur.com/WWmTu7c.png');
    if (streamChange.game && streamChange.game.name) {
        embed.addField(`Peli`, streamChange.game.name, true);
    }
    ;
    destination.send(null, {
        content: `[ <@&${role.id}> ]`,
        embed: embed
    });
};
exports.default = notifyRole;
