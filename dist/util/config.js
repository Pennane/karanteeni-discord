"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
console.log(process.env);
let PREFIX = '/';
let COUNTING_GAME = {
    DATA_LOCATION: './count_up/data.json'
};
let DISCORD = {
    ID_MAP: {
        GUILD: '206518503144947712',
        CHANNELS: {
            CURRENT_PLAYERS_ON_MINECRAFT_SERVER: '726867745328595005',
            ALL_PLAYERS_ON_DISCORD: '726867540134854767',
            TWITCH_NOTIFICATIONS: '749599869609574462',
            COUNT_UP_GAME: '785163774868586517',
            COUNT_UP_ACHIEVEMENTS: '785163776797835265'
        }
    },
    TOKEN: process.env.DISCORD_TOKEN,
    ADMIN: '143097697828601857'
};
let TWITCH = {
    LISTENER: {
        NGROK: process.env.NGROK,
        HOSTNAME: process.env.TWITCH_HOSTNAME
    },
    CLIENT_ID: process.env.TWITCH_CLIENT_ID,
    SECRET: process.env.TWITCH_CLIENT_SECRET
};
if (process.env.NODE_ENV === 'development') {
    PREFIX = '-';
    DISCORD.ID_MAP.CHANNELS.COUNT_UP_GAME = '804096001191182338';
    DISCORD.ID_MAP.CHANNELS.COUNT_UP_ACHIEVEMENTS = '749663615547605142';
    COUNTING_GAME.DATA_LOCATION = './count_up/test_data.json';
}
const config = {
    PREFIX,
    COUNTING_GAME,
    DISCORD,
    TWITCH
};
exports.default = config;
