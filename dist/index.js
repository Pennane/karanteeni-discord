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
const discord_js_1 = __importDefault(require("discord.js"));
const node_schedule_1 = __importDefault(require("node-schedule"));
const chalk_1 = __importDefault(require("chalk"));
const config_1 = __importDefault(require("./util/config"));
const status_1 = __importDefault(require("./server_status/status"));
const listeners_1 = __importDefault(require("./reaction_handling/listeners"));
const handler_1 = __importDefault(require("./message_handling/handler"));
const twitch_1 = __importDefault(require("./twitch_integration/twitch"));
const notify_1 = __importDefault(require("./twitch_integration/notify"));
const index_1 = __importDefault(require("./count_up/index"));
let startingDate = Date.now();
const client = new discord_js_1.default.Client();
const countingGameChannel = config_1.default.DISCORD.ID_MAP.CHANNELS.COUNT_UP_GAME;
const toggleRole = (member, roleName, type) => {
    let guild = member.guild;
    if (config_1.default.DISCORD.ID_MAP.GUILD !== guild.id)
        throw new Error('Tried to toggle role for wrong guild');
    let role = guild.roles.cache.find((role) => role.name === roleName);
    if (!role)
        return console.error("Main guild does not have a role named '" + roleName + "'");
    if (type === 'ADD') {
        member.roles.add(role);
    }
    else if (type === 'REMOVE') {
        member.roles.remove(role);
    }
};
const updateAutomatedRoles = () => __awaiter(void 0, void 0, void 0, function* () {
    const guild = yield client.guilds.fetch(config_1.default.DISCORD.ID_MAP.GUILD);
    if (!guild)
        throw new Error('Client has an invalid MAIN_GUILD_ID');
    listeners_1.default.forEach((listener) => __awaiter(void 0, void 0, void 0, function* () {
        let channel = yield client.channels.fetch(listener.location.channel);
        if (!channel)
            return console.info(chalk_1.default.red(listener.name + ' uses a channel that does not exist in MAIN GUILD'));
        if (channel.type !== 'text')
            throw new Error('Tried to pass a channel that is not a text channel');
        let message = yield channel.messages.fetch(listener.location.message);
        if (!message)
            return console.info(chalk_1.default.red(listener.name + ' uses a message id that can not be found'));
        let reactionCache = message.reactions.cache.get(listener.emoji.id || listener.emoji.name);
        if (!reactionCache) {
            message.react(listener.emoji.id || listener.emoji.name);
            return;
        }
        if (!reactionCache.me) {
            message.react(listener.emoji.id || listener.emoji.name);
        }
        let reactedUsers = yield reactionCache.users.fetch();
        if (!reactedUsers)
            return;
        let roleName = listener.role.name;
        let role = guild.roles.cache.find((role) => role.name === roleName);
        if (!role || role === undefined)
            return console.info(chalk_1.default.red("Missing role '" + roleName + "'"));
        let memberCache = guild.members.cache;
        reactedUsers.forEach((user) => {
            let member = memberCache.get(user.id);
            if (!member)
                return;
            if (member.roles.cache.find((role) => role.name === roleName))
                return;
            if (role) {
                member.roles.add(role);
            }
        });
    }));
});
const parseReaction = (parse) => __awaiter(void 0, void 0, void 0, function* () {
    let reactionListener = listeners_1.default.find((listener) => {
        let correctChannel = listener.location.message === parse.reaction.message.id;
        let correctEmoji = parse.reaction.emoji.id === null
            ? listener.emoji.name === parse.reaction.emoji.name
            : listener.emoji.id === parse.reaction.emoji.id;
        return correctChannel && correctEmoji;
    });
    if (!reactionListener)
        return;
    const guild = yield client.guilds.fetch(config_1.default.DISCORD.ID_MAP.GUILD);
    const user = parse.user;
    if (!user)
        return;
    let member = guild.member(user);
    if (!member)
        return;
    if (parse.type === 'ADD') {
        toggleRole(member, reactionListener.role.name, 'ADD');
    }
    else if (reactionListener.role.removable && parse.type === 'REMOVE') {
        toggleRole(member, reactionListener.role.name, 'REMOVE');
    }
});
const displayCachedNumberGame = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const channel = (yield client.channels.fetch(config_1.default.DISCORD.ID_MAP.CHANNELS.COUNT_UP_GAME));
        if (!channel)
            throw new Error('Number Game Channel missing');
        if (channel.type !== 'text')
            throw new Error('Tried to pass a channel that is not a text channel');
        const cachedNumber = index_1.default.cachedInteger();
        if (cachedNumber) {
            yield channel.send('`!!BOTTI ON KÄYNNISTETTY UUDESTAAN! BOTTI ILMOITTAA VIIMEISIMMÄN NUMERON!!`');
            yield channel.send(cachedNumber);
        }
        else {
            yield channel.send('`!!BOTTI ON KÄYNNISTETTY UUDESTAAN ILMAN TALLENNETTUA NUMEROA`');
        }
    }
    catch (exception) {
        console.info(exception);
    }
});
twitch_1.default.on('streamChange', (data) => __awaiter(void 0, void 0, void 0, function* () {
    if (!data || !data.user)
        return;
    if (data.type !== 'online')
        return;
    const guild = yield client.guilds.fetch(config_1.default.DISCORD.ID_MAP.GUILD);
    let channel = yield client.channels.fetch(config_1.default.DISCORD.ID_MAP.CHANNELS.TWITCH_NOTIFICATIONS);
    let role = guild.roles.cache.find((role) => role.name === 'Twitch');
    if (!role)
        return console.log('Missing twitch role, cannnot send notification.');
    notify_1.default({
        streamChange: data,
        role: role,
        destination: channel
    });
}));
client.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    const guild = yield client.guilds.fetch(config_1.default.DISCORD.ID_MAP.GUILD);
    // Update server status
    status_1.default.update(guild);
    // Add missing roles
    updateAutomatedRoles();
    // Start the counting game
    try {
        yield index_1.default.initializeGame(client);
        if (true || process.env.NODE_ENV === 'production') {
            displayCachedNumberGame();
        }
    }
    catch (exception) {
        console.error(exception);
    }
    // Update the info channel names in discord every 10 minutes
    let serverStatusScheduler = node_schedule_1.default.scheduleJob('*/10 * * * *', () => {
        status_1.default.update(guild);
    });
    // Check that the bot has given necessary roles every hour
    let rolesUptodateScheduler = node_schedule_1.default.scheduleJob('* */2 * * *', () => {
        updateAutomatedRoles();
    });
    console.info(chalk_1.default.blue('//// Botti virallisesti hereillä.'));
    console.info(chalk_1.default.blue('//// Käynnistyminen kesti'), chalk_1.default.red(Date.now() - startingDate), chalk_1.default.blue('ms'));
    console.info(chalk_1.default.blue('//// Discord serverillä yhteensä', chalk_1.default.yellow(guild.memberCount), chalk_1.default.blue('pelaajaa')));
    if (status_1.default.cached()) {
        console.info(chalk_1.default.blue('//// Minecraftissa tällä hetkellä', chalk_1.default.yellow(status_1.default.cached().players.online), chalk_1.default.blue('pelaajaa')));
    }
    else {
        console.info(chalk_1.default.red('//// Minecraft palvelin tuntuisi olevan pois päältä.'));
    }
}));
client.on('message', (message) => {
    const ignoreMessage = message.author.bot;
    if (ignoreMessage)
        return;
    handler_1.default.parse(message, client);
});
client.on('messageUpdate', (oldMessage, newMessage) => {
    if (!oldMessage || oldMessage.partial)
        return;
    if (!newMessage || newMessage.partial)
        return;
    if (newMessage.channel.id === countingGameChannel) {
        index_1.default.parseCountingGameMessageEdit(oldMessage, newMessage);
    }
});
client.on('messageDelete', (message) => {
    if (!message || message.partial)
        return;
    if (message.channel.id == countingGameChannel) {
        index_1.default.parseCountingGameMessageDelete(message);
    }
});
// Sends added reactions to be handled
client.on('messageReactionAdd', (reaction, user) => {
    if (!user || user.bot || user.partial)
        return;
    parseReaction({
        reaction: reaction,
        user: user,
        type: 'ADD'
    });
});
// Sends removed reactions to be handled
client.on('guildMemberAdd', (member) => {
    if (member.user.bot)
        return;
    toggleRole(member, 'Pelaaja', 'ADD');
});
client.on('messageReactionRemove', (reaction, user) => {
    if (!user || user.bot || user.partial)
        return;
    parseReaction({
        reaction: reaction,
        user: user,
        type: 'REMOVE'
    });
});
client.on('reconnecting', () => console.info('BOT RECONNECTING'));
client.on('resume', () => console.info('BOT RESUMED SUCCESFULLY'));
client.on('error', (err) => console.info('ERROR ON CLIENT:', err));
client.on('warn', (warn) => console.warn(warn));
process.on('uncaughtException', (err) => console.info('UNCAUGHT EXCEPTION ON PROCESS:', err));
client.login(config_1.default.DISCORD.TOKEN);
