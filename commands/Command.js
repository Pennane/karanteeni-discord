// all of the useless command business

const configuration = require('../configuration.json')

const PREFIX = configuration.DISCORD.PREFIX
const FORBIDDEN_WORDS = configuration.FORBIDDEN_WORDS

let hirvitysFiltteri = false;



function parseCommand(message) {
    let hasPrefix = message.content.startsWith(PREFIX)

    if (!hasPrefix) return;

    let args = message.content.trim().substr(PREFIX.length).split(' ')

    switch (args[0]) {
        case "puhista": {
            if (!message.member.hasPermission("ADMINISTRATOR")) return;

            let embed = new Discord.MessageEmbed().setColor(0xF4E542);

            if (args[1] >= 2 && args[1] <= 99) {
                embed.setDescription(`Poistin ${args[1]} viestiä.`)
                let amount = parseInt(args[1]) + 1;
                message.channel.bulkDelete(amount)
                    .then(() => {
                        message.channel.send(embed)
                            .then(message => message.delete({ timeout: 4000 }))
                            .catch(err => console.info(err))
                    })
                    .catch(error => console.error(error));
            } else {
                let embed = syntaxEmbed({ configuration, args })
                message.channel.send(embed).catch(err => console.info(err))
            }
            break;
        }
        case "hirvitysfiltteri": {
            if (message.guild === null) return;

            if (!message.member.hasPermission("ADMINISTRATOR")) return;

            let args = message.content.trim().split(' ')

            if (args[1] == 'true' || args[1] == 'päälle' || args[1] == 'on') {
                hirvitysFiltteri = true
            } else if (args[1] == 'false' || args[1] == 'pois' || args[1] == 'off') {
                hirvitysFiltteri = false
            }

            if (hirvitysFiltteri) {
                message.channel.send('Hirvitysfiltteri o päällä bro. Sanat "' + FORBIDDEN_WORDS.join(', ') + '" katoo ilman sisältöö')
            } else {
                message.channel.send('Hirvitysfiltteri ei oo päällä bro')
            }
            break;
        }
        case "sendmessage": {
            let guild = client.guilds.cache.get(configuration.ID_MAP.GUILD)
            if (!guild) return;

            let member = guild.members.cache.get(message.author.id);

            if (!member) return;

            if (!member.hasPermission("ADMINISTRATOR")) return;

            if (!args[1] || !args[2]) return;

            let targetChannelId = args[1]

            let targetChannel = guild.channels.cache.get(targetChannelId)

            if (!targetChannel) return;

            if (args[3]) {
                for (let i = 3; i < args.length; i++) {
                    args[2] = args[2] + ' ' + args[i];
                }
            }

            targetChannel.send(args[2])
            break;
        }
        case "komppaniassaherätys": {
            message.author.send('Komppaniassa herätys! Ovet auki, valot päälle. Taistelijat ylös punkasta. Hyvää huomenta komppania! \n\nTämän viestin jätti Susse ollessaan armeijassa. Punkassa rötinä oli kova ja odotus lomille sitäkin suurempi. Hajoaminen oli lähellä.')
            break;
        }

    }
}


client.on('message', async (message) => {
    if (message.author.bot) return;

    if (hirvitysFiltteri && message.deletable) {
        FORBIDDEN_WORDS.forEach(word => {
            if (message.content.toLowerCase() === "ok" || message.content.toLowerCase() === "eiku") {
                return message.delete({ reason: "stop, hirvitysfiltteri ei hyväksy" })
            }
        })
    }

    if (message.content.toLowerCase().startsWith(PREFIX)) {
        parseCommand(message)
    }
})