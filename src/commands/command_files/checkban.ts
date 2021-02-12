import Command, { CommandExecutor } from '../Command'

import { currentBan } from '../../moderation/index'
import { parseDuration } from '../../moderation/utils'

const configuration = {
    name: 'checkban',
    admin: true,
    syntax: 'checban <userId>',
    desc: 'Bänni ukkeli',
    triggers: ['checkban', 'check'],
    type: ['työkalut'],
    requireGuild: false
}

const executor: CommandExecutor = (message, client, args) => {
    return new Promise(async (resolve, reject) => {
        if (!client) return
        if (!args[1]) {
            message.channel.send(configuration.syntax)
            return resolve()
        }

        let [_command, targetId] = args

        if (targetId.startsWith('<@') && targetId.endsWith('>')) {
            targetId = targetId.slice(2, -1)
            if (targetId.startsWith('!')) {
                targetId = targetId.slice(1)
            }
        }

        if (!targetId) {
            message.channel.send(configuration.syntax)
            return resolve()
        }

        const ban = await currentBan(targetId)
        if (ban) {
            message.channel.send(
                `<@${targetId}> is banned with reason \`${ban.reason}\`. \n${
                    ban.duration === 'permanent'
                        ? `The ban is permanent.`
                        : `Ban expires \`${new Date(ban.date + (ban.duration as number))}\``
                }
              `
            )
        } else {
            message.channel.send(`<@${targetId}> is not banned.`)
        }
    })
}

export default new Command({
    configuration,
    executor
})
