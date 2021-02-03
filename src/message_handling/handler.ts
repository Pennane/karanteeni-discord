import configuration from '../util/config'
import loader from '../commands/loader'
import { EventEmitter } from 'events'
import Discord from 'discord.js'

const { commands, triggers } = loader()
const prefix = configuration.PREFIX

export const SpecialMessages = new EventEmitter()

const handler = {
    parse: (message: Discord.Message, client: Discord.Client): void => {
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
        command.execute(message, client, args)

        return
    }
}

export default handler
