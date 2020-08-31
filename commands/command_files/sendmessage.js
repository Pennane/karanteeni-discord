const Discord = require('discord.js');

const clientConfiguration = require('../../configuration.json')

let embed = new Discord.MessageEmbed().setColor(0xF4E542);

const configuration = {
    name: "sendmessage",
    admin: true,
    syntax: "sendmessage <kanavan_id> <viesti>",
    desc: "Lähetä kanavalle viesti",
    triggers: ["sendmessage", "tekoäly.com"],
    type: ["työkalut"],
    requireGuild: false
}

module.exports = {
    executor: function (message, client, args) {
        return new Promise(async (resolve, reject) => {
            let guild = client.guilds.cache.get(clientConfiguration.DISCORD.ID_MAP.GUILD)
            if (!guild) return;

            if (!args[1] || !args[2]) return;

            let targetChannelId = args[1];

            let targetChannel = guild.channels.cache.get(targetChannelId)

            if (!targetChannel) return;

            if (args[3]) {
                for (let i = 3; i < args.length; i++) {
                    args[2] = args[2] + ' ' + args[i];
                }
            }

            targetChannel.send(args[2])

            resolve()
        });
    },
    configuration
}
