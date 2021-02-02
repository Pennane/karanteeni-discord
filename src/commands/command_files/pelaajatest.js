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
        return new Promise(async (resolve, reject) => {
            message.channel.send('joo komento toimi iha hyvin (tää oli tää jota kaikki voi käyttää)')
            resolve()
        })
    },
    configuration
}
