import Discord from 'discord.js'
let embed = new Discord.MessageEmbed().setColor(0xf4e542)

const configuration = {
    name: 'hae',
    admin: true,
    syntax: 'hae',
    desc: 'hae numeropeliin arvo',
    triggers: ['haearvo'],
    type: ['työkalut'],
    requireGuild: true
}

module.exports = {
    executor: function (message, client, args) {
        return new Promise(async (resolve, reject) => {
            const CountUpGame = require('../../count_up/index')
            let value = CountUpGame.current()
            embed.setTitle('Laskurin arvo').setDescription('Laskurissa tällä hetkelleä arvo: ' + value)
            message.channel.send(embed)
            resolve()
        })
    },
    configuration
}
