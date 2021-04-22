import Discord from 'discord.js'
import AppConfiguration from '../util/config'
import SyntaxEmbed, { SyntaxEmbedOptions } from './syntaxEmbed'

export type CommandExecutor = (
    message: Discord.Message,
    client: Discord.Client | undefined,
    args: Array<string>
) => Promise<void>

export interface CommandConfiguration {
    name: string
    syntax: string
    desc: string
    triggers: Array<string>
    type: Array<string>
    admin?: boolean
    superAdmin?: boolean
    hidden?: boolean
    requireGuild: boolean
}

interface CommandInitializer {
    configuration: CommandConfiguration
    executor: (message: Discord.Message, client: Discord.Client | undefined, args: Array<string>) => Promise<void>
}

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
]

const typeNames = commandVariants.map((type) => type.name)

class Command {
    _type: Array<string>
    _hidden: boolean | undefined
    _description: string
    _syntax: string
    _name: string
    _triggers: Array<string>
    _adminCommand: boolean | undefined
    _superAdminCommand: boolean | undefined
    _requireGuild: boolean
    _executor: CommandExecutor
    _configuration: CommandConfiguration

    constructor(initializer: CommandInitializer) {
        const { configuration } = initializer
        this._configuration = configuration
        let types: Array<string> = []
        if (configuration.type) {
            configuration.type.forEach((type) => {
                if (typeNames.indexOf(type.toLowerCase()) === -1) return
                types.push(type.toLowerCase())
            })
        }
        this._type = types.length === 0 ? ['other'] : types
        if (configuration.hidden) {
            this._type = ['hidden']
            this._hidden = true
        }
        this._name = configuration.name
        this._description = configuration.desc
        this._syntax = configuration.syntax
        this._triggers = [...new Set(configuration.triggers)]
        this._adminCommand = configuration.admin
        this._superAdminCommand = configuration.superAdmin
        this._executor = initializer.executor
        this._requireGuild = typeof configuration.requireGuild === 'boolean' ? configuration.requireGuild : true
        if (this._adminCommand && this._type.indexOf('admin') === -1) {
            this._type.push('admin')
        }
    }

    get name() {
        return this._name
    }

    get triggers() {
        return this._triggers
    }

    static commandVariants() {
        return commandVariants
    }

    static async isMemberAdminAuthorized(message: Discord.Message, client: Discord.Client): Promise<boolean> {
        if (message.member) {
            return message.member.hasPermission('ADMINISTRATOR')
        } else {
            const guild = client.guilds.cache.get(AppConfiguration.DISCORD.ID_MAP.GUILD)
            if (!guild) throw new Error('Faulty guild id')
            const member = await guild.members.fetch(message.author)
            if (!member) return false
            return member.hasPermission('ADMINISTRATOR')
        }
    }

    static syntaxEmbed(options: SyntaxEmbedOptions) {
        return SyntaxEmbed(options)
    }

    static createEmbed(): Discord.MessageEmbed {
        return new Discord.MessageEmbed().setColor(0xf4e542)
    }

    unauthorizedAction(message: Discord.Message): void {
        message.reply('Sinulla ei ole oikeutta käyttää komentoa ' + this._name)
    }

    async execute(message: Discord.Message, client: Discord.Client, args: Array<string>): Promise<void> {
        if (this._requireGuild && !message.guild) return

        let adminAuthorization = false

        if (!client) return

        if (this._adminCommand) {
            adminAuthorization = await Command.isMemberAdminAuthorized(message, client)
        }

        if (this._adminCommand && !adminAuthorization) {
            return this.unauthorizedAction(message)
        }

        this._executor(message, client, args).catch((err) => console.info(err))
    }
}

export default Command
