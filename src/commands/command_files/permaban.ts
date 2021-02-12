import Command, { CommandExecutor } from '../Command'

import { ban } from '../../moderation/index'
import { parseDuration } from '../../moderation/utils'

const configuration = {
    name: 'permaban',
    admin: true,
    syntax: 'permaban <userId | @user> <reason>',
    desc: 'Bänni ukkeli',
    triggers: ['permaban'],
    type: ['työkalut'],
    requireGuild: false
}

const executor: CommandExecutor = (message, client, args) => {
    return new Promise(async (resolve, reject) => {
        if (!client) return
        if (!args[2]) {
            message.channel.send(configuration.syntax)
            return resolve()
        }

        let [_command, targetId, reason] = args

        if (targetId.startsWith('<@') && targetId.endsWith('>')) {
            targetId = targetId.slice(2, -1)
            if (targetId.startsWith('!')) {
                targetId = targetId.slice(1)
            }
        }
        if (!targetId || !reason) {
            message.channel.send(configuration.syntax)
            return resolve()
        }

        const newBan = await ban(targetId, 'permanent', reason)
        if (newBan) {
            message.channel.send(`Permanently banned <@${targetId}> with reason \`${newBan.reason}.\``)
        } else {
            message.channel.send(`Failed to permaban <@${targetId}>`)
        }
    })
}

export default new Command({
    configuration,
    executor
})
