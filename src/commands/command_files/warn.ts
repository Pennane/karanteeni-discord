import Command, { CommandExecutor } from '../Command'

import { warn } from '../../moderation/index'

const configuration = {
    name: 'warn',
    admin: true,
    syntax: 'warn <userId | @user> <reason>',
    desc: 'Warn ukkeli',
    triggers: ['warn', 'varoita'],
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

        const newWarn = await warn(targetId, reason)

        if (!newWarn) {
            message.channel.send(`Käyttäjää <@${targetId}> ei onnistuttu varoittamaan.`)
            return
        }

        message.channel.send(`Varoitettu käyttäjää <@${targetId}> syystä \`${newWarn.reason}\`.`)

        if (newWarn.causedBan) {
            message.channel.send(`ANNETTU VAROITUS ANTOI KÄYTTÄJÄLLE <@${targetId}> AUTOMAATTISET 14 PÄIVÄN BANNIT.`)
        }
    })
}

export default new Command({
    configuration,
    executor
})
