"use strict";
const configuration = require('../util/config');
function isObject(o) {
    return typeof o === 'object' && o !== null;
}
function isArray(a) {
    return Array.isArray(a);
}
function isFunction(f) {
    return typeof f === 'function';
}
const commandTypes = [
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
const typeNames = commandTypes.map((type) => type.name);
class Command {
    constructor({ configuration, executor }, filename) {
        if (!configuration || !isObject(configuration)) {
            console.warn(`WARNING - ${filename} : configuration not present`);
        }
        if (!configuration.triggers || !isArray(configuration.triggers)) {
            console.warn(`WARNING - ${filename} : triggers not present`);
        }
        if (!executor || !isFunction(executor)) {
            throw new Error(`ERROR - ${filename} : functionality not present`);
        }
        let types = [];
        if (configuration.type) {
            configuration.type.forEach((type) => {
                if (typeNames.indexOf(type.toLowerCase()) !== -1) {
                    types.push(type.toLowerCase());
                }
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
        this.superAdminCommand = configuration.superadmin;
        this.executor = executor;
        this.requireGuild = typeof configuration.requireGuild === 'boolean' ? configuration.requireGuild : true;
        if (this.adminCommand && this.type.indexOf('admin') === -1) {
            this.type.push('admin');
        }
    }
    static commandTypes() {
        return commandtypes;
    }
    static isMemberAdminAuthorized(message, client) {
        if (message.member) {
            return message.member.hasPermission('ADMINISTRATOR');
        }
        else {
            const guild = client.guilds.cache.get(configuration.DISCORD.ID_MAP.GUILD);
            const member = guild.member(message.author);
            return member.hasPermission('ADMINISTRATOR');
        }
    }
    unauthorizedAction(message) {
        message.reply('Sinulla ei ole oikeutta käyttää komentoa ' + this.name);
    }
    execute(message, client, args) {
        if (this.requireGuild && !message.guild)
            return;
        let adminAuthorization = false;
        if (this.adminCommand) {
            adminAuthorization = Command.isMemberAdminAuthorized(message, client);
        }
        if (this.adminCommand && !adminAuthorization) {
            return this.unauthorizedAction(message);
        }
        this.executor(message, client, args).catch((err) => console.info(err));
    }
}
module.exports = Command;
