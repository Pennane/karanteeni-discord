const Discord = require('discord.js');

let embed = new Discord.MessageEmbed().setColor(0xF4E542);

const configuration = {
    name: "test",
    admin: true,
    syntax: "test",
    desc: "testikomento",
    triggers: ["test", "asdf"],
    type: ["muut"],
    requireGuild: false
}

module.exports = {
    executor: function (message, client, args) {
        return new Promise(async (resolve, reject) => {
            message.channel.send("joo komento toimi iha hyvin")
            resolve()
        });
    },
    configuration
}
