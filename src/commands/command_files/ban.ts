import Command, { CommandExecutor } from '../Command'

import { ban } from '../../moderation/index'
import { parseDuration } from '../../moderation/utils'

const configuration = {
    name: 'ban',
    admin: true,
    syntax: 'ban <userId | @user> <duration as y | m | d | h | s> <reason>',
    desc: 'Bänni ukkeli',
    triggers: ['ban'],
    type: ['työkalut'],
    requireGuild: false
}

const executor: CommandExecutor = (message, client, args) => {
    return new Promise(async (resolve, reject) => {
        if (!client) return
        if (!args[3]) {
            message.channel.send(configuration.syntax)
            return resolve()
        }

        let [_command, targetId, durationString, ...reasonArray] = args

        if (targetId.startsWith('<@') && targetId.endsWith('>')) {
            targetId = targetId.slice(2, -1)
            if (targetId.startsWith('!')) {
                targetId = targetId.slice(1)
            }
        }

        let reason = reasonArray.join(' ')

        let duration = parseDuration(durationString)

        if (!targetId || !duration || !reason) {
            message.channel.send(configuration.syntax)
            return resolve()
        }

        const newBan = await ban(targetId, duration, reason)
        if (newBan) {
            message.channel.send(
                `Banned <@${targetId}> with reason \`${newBan.reason}\`. Ban expires \`${new Date(
                    newBan.date + (newBan.duration as number)
                )}\``
            )
        } else {
            message.channel.send(`Failed to ban <@${targetId}>`)
        }
    })
}

export default new Command({
    configuration,
    executor
})
