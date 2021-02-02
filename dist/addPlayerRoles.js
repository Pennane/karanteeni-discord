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
process.chdir(__dirname);
const { Client, Intents } = require('discord.js');
const configuration = require('./util/config');
const intents = new Intents([
    Intents.NON_PRIVILEGED,
    'GUILD_MEMBERS' // lets you request guild members (i.e. fixes the issue)
]);
const client = new Client({ ws: { intents } });
function addRole(member, role) {
    if (!member || !role)
        throw new Error('Missing arguments');
    if (!member.roles.cache.find((role) => role.name === 'Pelaaja')) {
        member.roles.add(role);
        return console.info(member.user.username + ' received the role.');
    }
}
client.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    const guild = yield client.guilds.fetch(configuration.DISCORD.ID_MAP.GUILD);
    const role = guild.roles.cache.find((role) => role.name === 'Pelaaja');
    console.info(guild.memberCount, guild.members.cache.size);
    console.info('Starting to fetch the guild members. This might take a while....');
    let members = yield guild.members.fetch();
    console.info('Fetched members. Amount of fetched members: ', [...members.values()].length);
    members.forEach((member) => {
        addRole(member, role);
    });
}));
client.login(configuration.DISCORD.TOKEN);
