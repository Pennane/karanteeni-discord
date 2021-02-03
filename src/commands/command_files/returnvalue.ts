import Command, { CommandExecutor } from '../Command'
import clientConfiguration from '../../util/config'
import { EventEmitter } from 'events'
import { TextChannel } from 'discord.js'

export const ValueReturner = new EventEmitter()

const configuration = {
    name: 'palauta',
    admin: true,
    syntax: 'palauta <arvo>',
    desc: 'Palauta numeropeliin arvo',
    triggers: ['palauta', 'saatanantunarit'],
    type: ['työkalut'],
    requireGuild: true
}

const executor: CommandExecutor = (message, client, args) => {
    return new Promise(async (resolve, reject) => {
        if (!client) return
        if (!args[1] || !message) return

        let value = parseInt(args[1])

        if (isNaN(value)) return

        let gameChannel = client.channels.cache.get(
            clientConfiguration.DISCORD.ID_MAP.CHANNELS.COUNT_UP_GAME
        ) as TextChannel

        if (!gameChannel) return console.log('missing gamechannel')

        let embed = Command.createEmbed()

        ValueReturner.emit('returnedValue', value)

        embed.setTitle('Palautetaan pelin arvoa...').setDescription('Asetetaan peliin arvo ' + value)
        message.channel.send(embed)

        gameChannel
            .send('`!!PELIIN ON PALAUTETTU UUSI ARVO! BOTTI ILMOITTAA VIIMEISIMMÄN NUMERON!!`')
            .then(() => gameChannel.send(value))
            .catch((err) => console.info(err))
        resolve()
    })
}

export default new Command({
    configuration,
    executor
})
