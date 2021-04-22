import Command, { CommandExecutor } from '../Command'

import { unban } from '../../moderation/index'

const configuration = {
    name: 'unban',
    admin: true,
    syntax: 'unban <userId | @user>',
    desc: 'Unbanni ukkeli',
    triggers: ['unban', 'pardon'],
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

        let user = await unban(targetId)
        if (user) {
            message.channel.send(`<@${targetId}> has been unbanned.`)
        } else {
            message.channel.send(`Failed to unban <@${targetId}>`)
        }
    })
}

export default new Command({
    configuration,
    executor
})
