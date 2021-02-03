"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = __importDefault(require("discord.js"));
let serverStatus = require('../../server_status/status.js').cached;
let minecraftChatId = '613071441268834304';
const configuration = {
    name: 'list',
    admin: false,
    syntax: 'list',
    desc: 'hakee pelaajat palvelimelta',
    triggers: ['list', 'lista'],
    type: ['työkalut'],
    requireGuild: true
};
module.exports = {
    executor: function (message, client, args) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (message.channel.id !== minecraftChatId) {
                return;
            }
            let embed = new discord_js_1.default.MessageEmbed().setColor(0xf4e542);
            let cachedStatus = serverStatus();
            if (!cachedStatus || !cachedStatus.players || !cachedStatus.players.list) {
                message.channel.send('Ei onnannut hakea severin pelaajia');
            }
            else {
                let players = cachedStatus.players.list.join(', ');
                embed.addField('Palvelimella viimeksi nähty seuraavat pelaajat:', players);
                message.channel.send(embed);
            }
            resolve();
        }));
    },
    configuration
};
