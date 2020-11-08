const Discord = require('discord.js');

let serverStatus = require('../../server_status/status.js').cached

const configuration = {
    name: "list",
    admin: true,
    syntax: "list",
    desc: "hakee pelaajat palvelimelta",
    triggers: ["list", "lista"],
    type: ["työkalut"],
    requireGuild: true
}

module.exports = {
    executor: function (message, client, args) {
        return new Promise(async (resolve, reject) => {
            let embed = new Discord.MessageEmbed().setColor(0xF4E542);
            let cachedStatus = serverStatus()
            if (!cachedStatus || !cachedStatus.players || !cachedStatus.players.list) {
                message.channel.send('Ei onnannut hakea severin pelaajia')
            } else {
                let players = cachedStatus.players.list.join(", ");
                embed.addField('Palvelimella viimeksi nähty seuraavat pelaajat:', players)
                message.channel.send(embed)
            }
            resolve()
        });
    },
    configuration
}
