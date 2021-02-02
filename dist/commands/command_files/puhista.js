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
const syntaxEmbed = require('../syntaxEmbed.js')
let embed = new Discord.MessageEmbed().setColor(0xf4e542)
const configuration = {
    name: 'puhista',
    admin: true,
    syntax: 'puhista <määrä 1-99>',
    desc: 'poistaa kanavalta x määrän viestejä',
    triggers: ['puhista'],
    type: ['työkalut'],
    requireGuild: false
}
module.exports = {
    executor: function (message, client, args) {
        return new Promise((resolve, reject) =>
            __awaiter(this, void 0, void 0, function* () {
                if (args[1] >= 2 && args[1] <= 99) {
                    embed.setDescription(`Poistin ${args[1]} viestiä.`)
                    let amount = parseInt(args[1]) + 1
                    yield message.channel.bulkDelete(amount)
                    message.channel
                        .send(embed)
                        .then((message) => message.delete({ timeout: 4000 }))
                        .catch((err) => console.info(err))
                } else {
                    let embed = syntaxEmbed({ configuration, args })
                    message.channel.send(embed).catch((err) => console.info(err))
                }
                resolve()
            })
        )
    },
    configuration
}
