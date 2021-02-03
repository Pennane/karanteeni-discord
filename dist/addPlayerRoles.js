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
process.chdir(__dirname);
const discord_js_1 = require("discord.js");
const config_1 = __importDefault(require("./util/config"));
const intents = new discord_js_1.Intents([
    discord_js_1.Intents.NON_PRIVILEGED,
    'GUILD_MEMBERS' // lets you request guild members (i.e. fixes the issue)
]);
const client = new discord_js_1.Client({ ws: { intents } });
const addRole = (member, role) => {
    if (!member || !role)
        throw new Error('Missing arguments');
    if (!member.roles.cache.find((role) => role.name === 'Pelaaja')) {
        member.roles.add(role);
        return console.info(member.user.username + ' received the role.');
    }
};
client.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    const guild = yield client.guilds.fetch(config_1.default.DISCORD.ID_MAP.GUILD);
    const role = guild.roles.cache.find((role) => role.name === 'Pelaaja');
    if (!role)
        throw new Error('Did not have wanted role');
    console.info(guild.memberCount, guild.members.cache.size);
    console.info('Starting to fetch the guild members. This might take a while....');
    let members = yield guild.members.fetch();
    console.info('Fetched members. Amount of fetched members: ', [...members.values()].length);
    members.forEach((member) => {
        addRole(member, role);
    });
}));
client.login(config_1.default.DISCORD.TOKEN);
