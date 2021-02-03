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
const axios_1 = __importDefault(require("axios"));
const configuration = require('../util/config');
let serverStatusUrl = 'https://api.mcsrvstat.us/2/mc.karanteeni.net';
let cachedServerStatus = null;
let cachedMemberCount = null;
function fetchMinecraftServerStatus() {
    return new Promise((resolve, reject) => {
        axios_1.default
            .get(serverStatusUrl)
            .then(function (response) {
            resolve(response.data);
        })
            .catch(function (error) {
            reject(error);
        });
    });
}
function update(guild) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if (!guild || !guild.available)
            return console.info('Main guild is not available.');
        let minecraftplayersUpdateChannel = guild.channels.cache.get(configuration.DISCORD.ID_MAP.CHANNELS.CURRENT_PLAYERS_ON_MINECRAFT_SERVER);
        let discordusersUpdateChannel = guild.channels.cache.get(configuration.DISCORD.ID_MAP.CHANNELS.ALL_PLAYERS_ON_DISCORD);
        if (!minecraftplayersUpdateChannel || !discordusersUpdateChannel)
            throw new Error('Missing channel');
        let serverStatus = yield fetchMinecraftServerStatus();
        if (!minecraftplayersUpdateChannel.editable || !discordusersUpdateChannel.editable) {
            return console.info('Unable to edit required channels. Aborting.');
        }
        if (!cachedMemberCount || guild.memberCount !== cachedMemberCount) {
            discordusersUpdateChannel
                .edit({
                name: 'Pelaajia discordissa: ' + guild.memberCount
            })
                .catch((err) => console.info(err));
        }
        let statusHasPlayercount = (_a = serverStatus === null || serverStatus === void 0 ? void 0 : serverStatus.players) === null || _a === void 0 ? void 0 : _a.online;
        let cachedStatusHasPlayercount = (_b = cachedServerStatus === null || cachedServerStatus === void 0 ? void 0 : cachedServerStatus.players) === null || _b === void 0 ? void 0 : _b.online;
        if (!serverStatus) {
            // API down
            minecraftplayersUpdateChannel
                .edit({
                name: 'Pelaajia servulla: ?'
            })
                .catch((err) => console.info(err));
        }
        else if (statusHasPlayercount) {
            if (!cachedStatusHasPlayercount || serverStatus.players.online !== cachedServerStatus.players.online) {
                minecraftplayersUpdateChannel
                    .edit({
                    name: 'Pelaajia servulla: ' + serverStatus.players.online
                })
                    .catch((err) => console.info(err));
            }
        }
        else if (serverStatus.online === false) {
            if (!cachedServerStatus || cachedServerStatus.online !== false) {
                minecraftplayersUpdateChannel
                    .edit({
                    name: 'Palvelin poissa päältä'
                })
                    .catch((err) => console.info(err));
            }
        }
        cachedServerStatus = serverStatus;
        cachedMemberCount = guild.memberCount;
        resolve();
    }));
}
const status = {
    update: update,
    cached: () => cachedServerStatus
};
exports.default = status;
