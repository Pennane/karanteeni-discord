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
let embed = new Discord.MessageEmbed().setColor(0xf4e542)
const configuration = {
    name: 'pelaajatest',
    admin: false,
    syntax: 'pelaajatest',
    desc: 'testikomento',
    triggers: ['pelaajatest', 'böö'],
    type: ['muut']
}
module.exports = {
    executor: function (message, client, args) {
        return new Promise((resolve, reject) =>
            __awaiter(this, void 0, void 0, function* () {
                message.channel.send('joo komento toimi iha hyvin (tää oli tää jota kaikki voi käyttää)')
                resolve()
            })
        )
    },
    configuration
}
