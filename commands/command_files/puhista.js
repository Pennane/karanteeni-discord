const Discord = require('discord.js')

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
        return new Promise(async (resolve, reject) => {
            if (args[1] >= 2 && args[1] <= 99) {
                embed.setDescription(`Poistin ${args[1]} viestiä.`)
                let amount = parseInt(args[1]) + 1
                await message.channel.bulkDelete(amount)
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
    },
    configuration
}
