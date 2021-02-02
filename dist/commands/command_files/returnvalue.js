'use strict'
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value)
                  })
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value))
                } catch (e) {
                    reject(e)
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value))
                } catch (e) {
                    reject(e)
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected)
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next())
        })
    }
import Discord from 'discord.js'
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
        return new Promise((resolve, reject) =>
            __awaiter(this, void 0, void 0, function* () {
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
        )
    },
    configuration,
    ValueReturner
}
