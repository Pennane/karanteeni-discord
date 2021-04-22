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
        let syntaxEmbed = Command.syntaxEmbed({ configuration })
        if (!args[2]) {
            message.channel.send(syntaxEmbed)
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
            message.channel.send(syntaxEmbed)
            return resolve()
        }

        const newBan = await ban(targetId, 'permanent', reason)
        if (!newBan) {
            message.channel.send(`Käyttäjää <@${targetId}> ei onnistuttu bännäämään.`)
            return
        }
        message.channel.send(`Permabannattu <@${targetId}> syystä \`${newBan.reason}.\``)
    })
}

export default new Command({
    configuration,
    executor
})
