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
exports.sendCountingStartsAtOne = exports.sendResetMessage = exports.findAndGiveAchievements = exports.findAchievement = exports.notifyFromAchievement = exports.pushHighestAchievedNumber = void 0;
const achievements_1 = __importDefault(require("./achievements"));
const discord_js_1 = __importDefault(require("discord.js"));
const pushHighestAchievedNumber = (value, destination) => {
    destination.edit({
        topic: 'Huikeat #laskuri saavutukset. Korkein saavutettu numero on ' + value
    });
};
exports.pushHighestAchievedNumber = pushHighestAchievedNumber;
const notifyFromAchievement = (achievementMessage, destination) => __awaiter(void 0, void 0, void 0, function* () {
    destination.send(achievementMessage);
});
exports.notifyFromAchievement = notifyFromAchievement;
const findAchievement = (int) => {
    if (int < 1)
        return undefined;
    return achievements_1.default.find((achievement) => {
        return achievement[0](int);
    });
};
exports.findAchievement = findAchievement;
const findAndGiveAchievements = (int, message, destination) => __awaiter(void 0, void 0, void 0, function* () {
    let achievement = exports.findAchievement(int);
    if (achievement) {
        let achievementFunction = achievement[1];
        let congratulationsMessage = achievementFunction(int, message);
        message.react('🎉');
        exports.notifyFromAchievement(congratulationsMessage, destination);
    }
});
exports.findAndGiveAchievements = findAndGiveAchievements;
const sendResetMessage = (destination, member, customMessage) => {
    let embed = new discord_js_1.default.MessageEmbed()
        .setColor(0xf4e542)
        .setTitle('Takas nollaan että läsähti!')
        .setDescription(`<@${member.user.id}> teki jotain hirveää`);
    if (customMessage) {
        embed.addField('huomio huomio', customMessage);
    }
    destination.send(embed);
};
exports.sendResetMessage = sendResetMessage;
const sendCountingStartsAtOne = (destination, oldMessage) => {
    let embed = new discord_js_1.default.MessageEmbed().setColor(0xf4e542);
    embed.setTitle('huomioikaa dumbot: se laskeminen alkaa ykkösestä');
    oldMessage.delete({ timeout: 7000 });
    destination
        .send(embed)
        .then((message) => message.delete({ timeout: 8000 }))
        .catch((err) => console.info(err));
};
exports.sendCountingStartsAtOne = sendCountingStartsAtOne;
