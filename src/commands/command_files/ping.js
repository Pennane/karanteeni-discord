import Discord from 'discord.js'

let embed = new Discord.MessageEmbed().setColor(0xf4e542)

const configuration = {
    name: 'ping',
    admin: true,
    syntax: 'ping',
    desc: 'pingaa bottia',
    triggers: ['ping', 'pong'],
    type: ['työkalut'],
    requireGuild: false
}

module.exports = {
    executor: function (message, client, args) {
        return new Promise(async (resolve, reject) => {
            embed.setTitle('Pong!').setDescription(Date.now() - message.createdTimestamp + 'ms')
            message.channel.send(embed)
            resolve()
        })
    },
    configuration
}
