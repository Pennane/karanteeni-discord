import { currentBan, fetchUser } from '../../moderation'
import Command, { CommandExecutor } from '../Command'

const configuration = {
    name: 'check',
    admin: true,
    syntax: 'check <userId/@user>',
    desc: 'Tarkasta tiedot ukkeli',
    triggers: ['check'],
    type: ['työkalut'],
    requireGuild: false
}

const executor: CommandExecutor = async (message, client, args) => {
    if (!client) return
    let syntaxEmbed = Command.syntaxEmbed({ configuration })

    if (!args[1]) {
        message.channel.send(syntaxEmbed)
        return
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
        return
    }

    const user = await fetchUser(targetId)

    if (!user) {
        message.channel.send(`Käyttäjästä <@${targetId}> ei ole tallennettua tietoa.`)
        return
    }

    let current = await currentBan(targetId)

    let embed = Command.createEmbed()
    embed.setTitle(`Tietoa käyttäjästä`)
    embed.setDescription(`Tietoa käyttäjästä <@${targetId}>`)
    embed.addField('Bannien määrä', user.allTimeBans.length)

    if (current) {
        embed.addField('Tällä hetkellä bännättynä?', 'kyllä')
        embed.addField('Bannien syy', current.reason)
        embed.addField(
            'Bannit päättyvät',
            current.duration === 'permanent'
                ? `Bannit ovat loputtomat.`
                : `Bannit loppuvat \`${new Date(current.date + (current.duration as number)).toLocaleDateString(
                      'fi'
                  )}\``
        )
    } else {
        embed.addField('Tällä hetkellä bännättynä?', 'ei')
    }

    embed.addField('Aktiivisten varoitusten määrä', user.warns.length)

    message.channel.send(embed)
}

export default new Command({
    configuration,
    executor
})
