import Command, { CommandExecutor } from '../Command'

import { warn } from '../../moderation/index'

const configuration = {
    name: 'warn',
    admin: true,
    syntax: 'warn <userId | @user>  <reason>',
    desc: 'Warn ukkeli',
    triggers: ['warn', 'varoita'],
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

        let [_command, targetId, ...reasonArray] = args

        if (targetId.startsWith('<@') && targetId.endsWith('>')) {
            targetId = targetId.slice(2, -1)
            if (targetId.startsWith('!')) {
                targetId = targetId.slice(1)
            }
        }

        let reason = reasonArray.join(' ')

        if (!targetId || !reason) {
            message.channel.send(configuration.syntax)
            return resolve()
        }

        const newWarn = await warn(targetId, reason)

        if (!newWarn) {
            message.channel.send(`Failed to warn <@${targetId}>`)
            return
        }

        message.channel.send(`Warned <@${targetId}> with reason \`${newWarn.reason}\`.`)

        if (newWarn.causedBan) {
            message.channel.send(`THE WARN CAUSED A BAN. <@${targetId}> HAS BEEN AUTOMATICALLY BANNED FOR 14 DAYS.`)
        }
    })
}

export default new Command({
    configuration,
    executor
})
