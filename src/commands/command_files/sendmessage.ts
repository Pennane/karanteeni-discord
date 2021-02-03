import Command, { CommandExecutor } from '../Command'
import Discord from 'discord.js'

const clientConfiguration = require('../../util/config')

const configuration = {
    name: 'sendmessage',
    admin: true,
    syntax: 'sendmessage <kanavan_id> <viesti>',
    desc: 'Lähetä kanavalle viesti',
    triggers: ['sendmessage', 'tekoäly.com'],
    type: ['työkalut'],
    requireGuild: false
}

const executor: CommandExecutor = (message, client, args) => {
    return new Promise(async (resolve, reject) => {
        if (!client) return console.error('missing client in sendmessage')

        if (!args[1] || !args[2]) return

        let targetChannelId = args[1]

        let targetChannel
        try {
            targetChannel = (await client.channels.fetch(targetChannelId)) as Discord.TextChannel
        } catch {}

        if (!targetChannel) return

        if (args[3]) {
            for (let i = 3; i < args.length; i++) {
                args[2] = args[2] + ' ' + args[i]
            }
        }

        targetChannel.send(args[2])

        resolve()
    })
}

export default new Command({
    configuration,
    executor
})
