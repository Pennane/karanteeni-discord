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
exports.ValueReturner = void 0;
const Command_1 = __importDefault(require("../Command"));
const config_1 = __importDefault(require("../../util/config"));
const events_1 = require("events");
exports.ValueReturner = new events_1.EventEmitter();
const configuration = {
    name: 'palauta',
    admin: true,
    syntax: 'palauta <arvo>',
    desc: 'Palauta numeropeliin arvo',
    triggers: ['palauta', 'saatanantunarit'],
    type: ['työkalut'],
    requireGuild: true
};
const executor = (message, client, args) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        if (!client)
            return;
        if (!args[1] || !message)
            return;
        let value = parseInt(args[1]);
        if (isNaN(value))
            return;
        let gameChannel = client.channels.cache.get(config_1.default.DISCORD.ID_MAP.CHANNELS.COUNT_UP_GAME);
        if (!gameChannel)
            return console.log('missing gamechannel');
        let embed = Command_1.default.createEmbed();
        exports.ValueReturner.emit('returnedValue', value);
        embed.setTitle('Palautetaan pelin arvoa...').setDescription('Asetetaan peliin arvo ' + value);
        message.channel.send(embed);
        gameChannel
            .send('`!!PELIIN ON PALAUTETTU UUSI ARVO! BOTTI ILMOITTAA VIIMEISIMMÄN NUMERON!!`')
            .then(() => gameChannel.send(value))
            .catch((err) => console.info(err));
        resolve();
    }));
};
exports.default = new Command_1.default({
    configuration,
    executor
});
