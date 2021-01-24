const Discord = require('discord.js')
let clientConfiguration = require('../../util/config')

let embed = new Discord.MessageEmbed().setColor(0xf4e542)

const { EventEmitter } = require('events')
const ValueReturner = new EventEmitter()

const configuration = {
    name: 'palauta',
    admin: true,
    syntax: 'palauta <arvo>',
    desc: 'Palauta numeropeliin arvo',
    triggers: ['palauta', 'saatanantunarit'],
    type: ['työkalut'],
    requireGuild: true
}

module.exports = {
    executor: function (message, client, args) {
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
                .catch((err) => console.log(err))
            resolve()
        })
    },
    configuration,
    ValueReturner
}
