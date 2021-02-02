import Discord from 'discord.js'

let serverStatus = require('../../server_status/status.js').cached

let minecraftChatId = '613071441268834304'

const configuration = {
    name: 'list',
    admin: false,
    syntax: 'list',
    desc: 'hakee pelaajat palvelimelta',
    triggers: ['list', 'lista'],
    type: ['työkalut'],
    requireGuild: true
}

module.exports = {
    executor: function (message, client, args) {
        return new Promise(async (resolve, reject) => {
            if (message.channel.id !== minecraftChatId) {
                return
            }
            let embed = new Discord.MessageEmbed().setColor(0xf4e542)
            let cachedStatus = serverStatus()
            if (!cachedStatus || !cachedStatus.players || !cachedStatus.players.list) {
                message.channel.send('Ei onnannut hakea severin pelaajia')
            } else {
                let players = cachedStatus.players.list.join(', ')
                embed.addField('Palvelimella viimeksi nähty seuraavat pelaajat:', players)
                message.channel.send(embed)
            }
            resolve()
        })
    },
    configuration
}
