import Command, { CommandExecutor } from '../Command'

import { clearwarns } from '../../moderation/index'

const configuration = {
    name: 'clearwarns',
    admin: true,
    syntax: 'clearwarns <userId | @user>',
    desc: 'Unwarn kaikki ukkeli',
    triggers: ['clearwarns'],
    type: ['työkalut'],
    requireGuild: false
}

const executor: CommandExecutor = (message, client, args) => {
    return new Promise(async (resolve, reject) => {
        if (!client) return
        let syntaxEmbed = Command.syntaxEmbed({ configuration })

        if (!args[1]) {
            message.channel.send(syntaxEmbed)
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
            message.channel.send(syntaxEmbed)
            return resolve()
        }

        const afterUnwarn = await clearwarns(targetId)

        if (!afterUnwarn) {
            message.channel.send('Kyseiseltä käyttäjältä ei voitu poistaa varoituksia, sos')
            return
        }

        message.channel.send(`Käyttäjän varoitukset tyhjennetty`)
    })
}

export default new Command({
    configuration,
    executor
})
