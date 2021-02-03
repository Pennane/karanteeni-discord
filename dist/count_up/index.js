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
const config_1 = __importDefault(require("../util/config"));
const fs_1 = __importDefault(require("fs"));
const discord_js_1 = __importDefault(require("discord.js"));
const returnvalue_1 = require("../commands/command_files/returnvalue");
const handler_1 = require("../message_handling/handler");
const util_1 = require("./util");
let cache;
let currentNumber = 0;
let maxUserBufferLength = 2;
let userBuffer = [];
const initializeData = () => {
    let dataLocation = config_1.default.COUNTING_GAME.DATA_LOCATION;
    if (!fs_1.default.existsSync(dataLocation)) {
        fs_1.default.writeFileSync(dataLocation, '{"lastSavedInteger": 0, "highestAchievedInteger": 0}');
    }
    cache = JSON.parse(fs_1.default.readFileSync(dataLocation, 'utf8'));
    if (cache.lastSavedInteger) {
        currentNumber = cache.lastSavedInteger;
    }
};
initializeData();
const resetGame = (member, customMessage, destination, messageHandledAlready) => {
    if (!messageHandledAlready) {
        util_1.sendResetMessage(destination, member, customMessage);
    }
    currentNumber = 0;
    userBuffer = [];
};
const saveValue = (value) => {
    cache.lastSavedInteger = value;
    currentNumber = value;
    if (!cache.highestAchievedInteger || value > cache.highestAchievedInteger) {
        cache.highestAchievedInteger = value;
    }
    fs_1.default.writeFile(config_1.default.COUNTING_GAME.DATA_LOCATION, JSON.stringify(cache), function (err) {
        if (err) {
            return console.info(err);
        }
    });
};
const handleMessageEdit = (oldMessage, newMessage) => {
    var _a, _b;
    if (newMessage.author.bot || currentNumber === 0)
        return;
    let oldInteger = parseInt(oldMessage.content);
    let newInteger = parseInt(newMessage.content);
    if (!oldInteger || oldInteger > currentNumber || oldInteger === newInteger)
        return;
    const userId = (_b = (_a = newMessage === null || newMessage === void 0 ? void 0 : newMessage.member) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id;
    let embed = new discord_js_1.default.MessageEmbed()
        .setColor(0xf44242)
        .setTitle('Takas nollaan että läsähti!')
        .addField('Vanha arvo:', oldInteger, true)
        .addField('Uusi arvo:', newInteger, true);
    if (userId) {
        embed.setDescription(`<@${userId}> vaihtoi viestin arvoa.`);
    }
    else {
        embed.setDescription(`Joku vaihtoi viestin arvoa.`);
    }
    newMessage.channel.send(embed);
    resetGame(newMessage.member, null, null, true);
    saveValue(0);
};
const handleMessageDelete = (message) => {
    var _a, _b;
    if (message.author.bot || currentNumber === 0)
        return;
    let removedInteger = parseInt(message.content);
    if (!removedInteger || removedInteger > currentNumber || removedInteger < currentNumber - 3)
        return;
    const userId = (_b = (_a = message === null || message === void 0 ? void 0 : message.member) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id;
    let embed = new discord_js_1.default.MessageEmbed()
        .setColor(0xf44242)
        .setTitle('Takas nollaan että läsähti!')
        .addField('Poistettu arvo oli:', removedInteger, true);
    if (userId) {
        embed.setDescription(`<@${userId}> poisti liian uuden viestin.`);
    }
    else {
        embed.setDescription(`Joku poisti liian uuden viestin.`);
    }
    message.channel.send(embed);
    resetGame(message.member, null, null, true);
    saveValue(0);
};
const execute = (client) => __awaiter(void 0, void 0, void 0, function* () {
    const gameChannel = yield client.channels.fetch(config_1.default.DISCORD.ID_MAP.CHANNELS.COUNT_UP_GAME);
    const achievementChannel = yield client.channels.fetch(config_1.default.DISCORD.ID_MAP.CHANNELS.COUNT_UP_ACHIEVEMENTS);
    if (!gameChannel || !achievementChannel) {
        throw new Error('Missing required DISCORD content');
    }
    const handleGameMessage = (message) => {
        let { content, channel, member } = message;
        let sentInteger = parseInt(content);
        message.type;
        if (currentNumber === 0 && sentInteger !== 1 && !isNaN(sentInteger)) {
            util_1.sendCountingStartsAtOne(channel, message);
        }
        if (!member)
            return;
        if (!member.hasPermission('ADMINISTRATOR') && isNaN(sentInteger)) {
            /* Sent message did not start with number */
            message.delete();
            resetGame(member, 'pelkkiä lukuja chattiin', channel);
        }
        else if (userBuffer.indexOf(member.id) !== -1 && currentNumber !== 0) {
            /* Sent message was from user in userbuffer */
            resetGame(member, `anna vähintään ${maxUserBufferLength} pelaajan nostaa lukua ensin`, channel);
        }
        else if (sentInteger !== currentNumber + 1 && currentNumber > 1) {
            /* Sent message had wrong next number */
            resetGame(member, null, channel);
        }
        else if (sentInteger === currentNumber + 1 && userBuffer.indexOf(member.id) === -1) {
            /* SENT MESSAGE WAS CORRECT FOR ONCE*/
            currentNumber++;
            userBuffer.unshift(member.id);
        }
        /* Find possible achievements and update achievement channel */
        util_1.findAndGiveAchievements(currentNumber, message, achievementChannel);
        if (!cache.highestAchievedInteger || sentInteger > cache.highestAchievedInteger) {
            /* Save highest achieved number to achievement channel in discord */
            util_1.pushHighestAchievedNumber(sentInteger, achievementChannel);
        }
        if (cache.lastSavedInteger !== currentNumber) {
            saveValue(currentNumber);
        }
        /* Reduce userbuffer to max length */
        while (userBuffer.length > maxUserBufferLength) {
            userBuffer.pop();
        }
    };
    handler_1.SpecialMessages.on('countingGameMessage', (message) => handleGameMessage(message));
    returnvalue_1.ValueReturner.on('returnedValue', (value) => {
        saveValue(value);
        userBuffer = [];
    });
});
const countingGame = {
    current: () => currentNumber,
    cachedInteger: () => cache.lastSavedInteger,
    highestAchievedInteger: () => cache.highestAchievedInteger,
    initializeGame: execute,
    parseCountingGameMessageEdit: handleMessageEdit,
    parseCountingGameMessageDelete: handleMessageDelete
};
exports.default = countingGame;
