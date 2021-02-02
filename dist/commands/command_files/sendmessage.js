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
const clientConfiguration = require('../../util/config')
let embed = new Discord.MessageEmbed().setColor(0xf4e542)
const configuration = {
    name: 'sendmessage',
    admin: true,
    syntax: 'sendmessage <kanavan_id> <viesti>',
    desc: 'Lähetä kanavalle viesti',
    triggers: ['sendmessage', 'tekoäly.com'],
    type: ['työkalut'],
    requireGuild: false
}
module.exports = {
    executor: function (message, client, args) {
        return new Promise((resolve, reject) =>
            __awaiter(this, void 0, void 0, function* () {
                let guild = client.guilds.cache.get(clientConfiguration.DISCORD.ID_MAP.GUILD)
                if (!guild) return
                if (!args[1] || !args[2]) return
                let targetChannelId = args[1]
                let targetChannel = guild.channels.cache.get(targetChannelId)
                if (!targetChannel) return
                if (args[3]) {
                    for (let i = 3; i < args.length; i++) {
                        args[2] = args[2] + ' ' + args[i]
                    }
                }
                targetChannel.send(args[2])
                resolve()
            })
        )
    },
    configuration
}
