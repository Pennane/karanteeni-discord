import Command, { CommandExecutor } from '../Command'
import clientConfiguration from '../../util/config'
import { EventEmitter } from 'events'

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
            if (!args[1]) return

            let value = parseInt(args[1])

            if (isNaN(value)) return

            let gameChannel = message.guild.channels.cache.get(
                clientConfiguration.DISCORD.ID_MAP.CHANNELS.COUNT_UP_GAME
            )
            ValueReturner.emit('returnedValue', value)

            embed.setTitle('Palautetaan pelin arvoa...').setDescription('Asetetaan peliin arvo ' + value)
            message.channel.send(embed)

            gameChannel
                .send('`!!PELIIN ON PALAUTETTU UUSI ARVO! BOTTI ILMOITTAA VIIMEISIMMÄN NUMERON!!`')
                .then((m) => gameChannel.send(value))
                .catch((err) => console.info(err))
            resolve()
        })
    }
}

export default new Command({
    configuration,
    executor
})










