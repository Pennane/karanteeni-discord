"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = __importDefault(require("discord.js"));
const config_1 = __importDefault(require("../util/config"));
const commandVariants = [
    {
        name: 'hauskat',
        description: 'Sekalaisia juksutuksia',
        emoji: ':100:'
    },
    {
        name: 'työkalut',
        description: 'Hyödyllisiä toimintoja',
        emoji: ':wrench:'
    },
    {
        name: 'kuvat',
        description: 'Kuvien manipulointia',
        emoji: ':frame_photo:'
    },
    {
        name: 'admin',
        description: 'Vain ylläpitäjille',
        emoji: ':crown:'
    },
    {
        name: 'muut',
        description: 'Muita komentoja',
        emoji: ':grey_question:'
    }
];
const typeNames = commandVariants.map((type) => type.name);
class Command {
    constructor(initializer) {
        const { configuration } = initializer;
        let types = [];
        if (configuration.type) {
            configuration.type.forEach((type) => {
                if (typeNames.indexOf(type.toLowerCase()) === -1)
                    return;
                types.push(type.toLowerCase());
            });
        }
        this.type = types.length === 0 ? ['other'] : types;
        if (configuration.hidden) {
            this.type = ['hidden'];
            this.hidden = true;
        }
        this.name = configuration.name;
        this.description = configuration.desc;
        this.syntax = configuration.syntax;
        this.triggers = [...new Set(configuration.triggers)];
        this.adminCommand = configuration.admin;
        this.superAdminCommand = configuration.superAdmin;
        this.executor = initializer.executor;
        this.requireGuild = typeof configuration.requireGuild === 'boolean' ? configuration.requireGuild : true;
        if (this.adminCommand && this.type.indexOf('admin') === -1) {
            this.type.push('admin');
        }
    }
    static commandVariants() {
        return commandVariants;
    }
    static isMemberAdminAuthorized(message, client) {
        if (message.member) {
            return message.member.hasPermission('ADMINISTRATOR');
        }
        else {
            const guild = client.guilds.cache.get(config_1.default.DISCORD.ID_MAP.GUILD);
            if (!guild)
                throw new Error('Faulty guild id');
            const member = guild.member(message.author);
            if (!member)
                return false;
            return member.hasPermission('ADMINISTRATOR');
        }
    }
    static createEmbed() {
        return new discord_js_1.default.MessageEmbed().setColor(0xf4e542);
    }
    unauthorizedAction(message) {
        message.reply('Sinulla ei ole oikeutta käyttää komentoa ' + this.name);
    }
    execute(message, client, args) {
        if (this.requireGuild && !message.guild)
            return;
        let adminAuthorization = false;
        if (!client)
            if (this.adminCommand) {
                adminAuthorization = client ? Command.isMemberAdminAuthorized(message, client) : false;
            }
        if (this.adminCommand && !adminAuthorization) {
            return this.unauthorizedAction(message);
        }
        this.executor(message, client, args).catch((err) => console.info(err));
    }
}
exports.default = Command;
