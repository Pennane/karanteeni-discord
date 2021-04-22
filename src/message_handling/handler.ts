import configuration from '../util/config'
import Command from '../commands/Command'
import loader from '../commands/loader'
import { EventEmitter } from 'events'
import Discord from 'discord.js'

let triggers: { [trigger: string]: string }
let commands: Map<string, Command>

let initialized: boolean = false

const init = async () => {
    const loaded = await loader()
    commands = loaded.commands
    triggers = loaded.triggers
    initialized = true
}

const prefix = configuration.PREFIX

export const SpecialMessages = new EventEmitter()

const handler = {
    parse: async (message: Discord.Message, client: Discord.Client): Promise<void> => {
        if (!initialized) {
            await init()
        }

        if (message.channel.id === configuration.DISCORD.ID_MAP.CHANNELS.COUNT_UP_GAME) {
            SpecialMessages.emit('countingGameMessage', message)
            return
        }

        let hasPrefix = message.content.startsWith(prefix)

        if (!hasPrefix && message.content.includes('bad bot')) {
            message.channel.send('no u')
            return
        }

        if (!hasPrefix && message.content.includes('good bot')) {
            message.channel.send('ty')
            return
        }

        if (!hasPrefix) return

        let args = message.content.trim().substr(prefix.length).split(' ')

        let trigger = args[0].toLowerCase()
        if (!triggers.hasOwnProperty(trigger)) return

        let command = commands.get(triggers[trigger])
        if (!command || !command.execute) return

        command.execute(message, client, args)

        return
    }
}

export default handler
