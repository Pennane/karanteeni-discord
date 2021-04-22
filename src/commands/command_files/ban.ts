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
        let syntaxEmbed = Command.syntaxEmbed({ configuration })
        if (!client) return
        if (!args[3]) {
            message.channel.send(syntaxEmbed)
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
            message.channel.send(syntaxEmbed)
            return resolve()
        }

        const newBan = await ban(targetId, duration, reason)
        if (!newBan) {
            message.channel.send(`Käyttäjää <@${targetId} ei onnistuttu bannaamaan.>`)
            return
        }

        message.channel.send(
            `Bannittu <@${targetId}> syystä \`${newBan.reason}\`. Bannit loppuvat \`${new Date(
                newBan.date + (newBan.duration as number)
            ).toLocaleDateString('fi')}\``
        )
    })
}

export default new Command({
    configuration,
    executor
})
