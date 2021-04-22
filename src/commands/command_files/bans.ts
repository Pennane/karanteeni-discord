import Command, { CommandExecutor } from '../Command'

import { getBans } from '../../moderation/index'

const configuration = {
    name: 'bans',
    admin: true,
    syntax: 'bans <userid/@user>',
    desc: 'kaikki bannit ukkeli',
    triggers: ['bans'],
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

        const bans = await getBans(targetId)

        if (!bans || bans.length === 0) {
            message.channel.send('Käyttäjällä ei ole banneja.')
            return
        }

        let embed = Command.createEmbed()
        embed.setTitle('Käyttäjän bannit')
        embed.setDescription(`Käyttäjän <@${targetId}> bannit`)
        bans.forEach((ban) =>
            embed.addField(
                new Date(ban.date).toLocaleDateString('fi'),
                `Syy: ${ban.reason}\nPäättyvät/päättyivät: ${
                    ban.duration === 'permanent'
                        ? 'loputtomat bannit'
                        : new Date(ban.date + ban.duration).toLocaleDateString('fi')
                }`
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
