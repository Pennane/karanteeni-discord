import Command, { CommandExecutor } from '../Command'

import { getWarns } from '../../moderation/index'

const configuration = {
    name: 'warns',
    admin: true,
    syntax: 'warns <userid/@user>',
    desc: 'kaikki warnit ukkeli',
    triggers: ['warns'],
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

        const warns = await getWarns(targetId)

        if (!warns || warns.length === 0) {
            message.channel.send('Käyttäjällä ei ole aktiivisia varoituksia.')
            return
        }

        let embed = Command.createEmbed()
        embed.setTitle('Käyttäjän varoitukset')
        embed.setDescription(`Käyttäjän <@${targetId}> varoitukset`)
        embed.addField(`Rankaisemattomien varoitusten määrä:`, warns.filter((warn) => warn.penalised === false).length)
        warns.forEach((warn) =>
            embed.addField(
                new Date(warn.date).toLocaleDateString('fi'),
                `Syy: ${warn.reason} \n ID: \`${warn.id}\`\n Rankaistu: \`${warn.penalised ? 'kyllä' : 'ei'}\``
            )
        )
        try {
            message.channel.send(embed)
        } catch {
            message.channel.send('Yks keissi kävi minkä ei pitäny käyä')
        }
    })
}

export default new Command({
    configuration,
    executor
})
