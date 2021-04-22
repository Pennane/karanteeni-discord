import Command, { CommandExecutor } from '../Command'

import { unwarn } from '../../moderation/index'

const configuration = {
    name: 'unwarn',
    admin: true,
    syntax: 'unwarn <userId | @user>  <warn id>',
    desc: 'Unwarn ukkeli',
    triggers: ['unwarn'],
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

        let [_command, targetId, warnId] = args

        if (targetId.startsWith('<@') && targetId.endsWith('>')) {
            targetId = targetId.slice(2, -1)
            if (targetId.startsWith('!')) {
                targetId = targetId.slice(1)
            }
        }

        if (!targetId || !warnId) {
            message.channel.send(syntaxEmbed)
            return resolve()
        }

        const afterUnwarn = await unwarn(targetId, warnId)

        if (!afterUnwarn) {
            message.channel.send('Kyseiseltä käyttäjältä ei voitu poistaa varoitusta kyseisellä id:llä')
            return
        }

        message.channel.send(`Varoitus \`${warnId}\` poistettu`)
    })
}

export default new Command({
    configuration,
    executor
})
