process.chdir(__dirname)

let startingDate = Date.now()

const schedule = require('node-schedule')
const Discord = require('discord.js')
const chalk = require('chalk')
const axios = require('axios').default;

const configuration = require('./configuration.json')
const authorize = require('./authorize.json')

const client = new Discord.Client()

const RULES_READ_EMOJI = "✅";
const NOTIFY_ROLE_EMOJI = "❗"

let cachedServerStatus = null;
let cachedMemberCount = null;

let hirvitysFiltteri = false;

function parseReaction(reaction) {
    if (reaction.reaction.message.id === configuration.ID_MAP.MESSAGES.RULE_REACTION_MESSAGE) {
        if (reaction.reaction._emoji.name === RULES_READ_EMOJI && reaction.type === "ADD") {
            toggleRole(reaction.user, "Pelaaja", reaction.type)
        }
        if (reaction.reaction._emoji.name === NOTIFY_ROLE_EMOJI) {
            toggleRole(reaction.user, "Ilmoitukset", reaction.type)
        }
    }
}

function toggleRole(user, roleName, type) {
    let guild = client.guilds.cache.get(configuration.ID_MAP.GUILD)
    if (!guild) throw new Error("Client has an invalid main guild id")

    let role = guild.roles.cache.find(role => role.name === roleName)
    if (!role) throw new Error("Main guild does not have a role named '" + roleName + "'")

    let member = guild.members.cache.get(user.id)
    if (!member) throw new Error("Guild does not have received user as a member")

    if (type === "ADD") {
        member.roles.add(role);
    } else if (type === "REMOVE") {
        member.roles.remove(role);
    }

}

function cacheRequiredMessages() {
    return new Promise((resolve, reject) => {
        let rulesTextChannel = client.channels.cache.get(configuration.ID_MAP.CHANNELS.CHANNEL_RULES)
        rulesTextChannel.messages.fetch(configuration.ID_MAP.MESSAGES.ruleRoleMessage)
            .then(() => {
                resolve()
            })
            .catch(error => {
                console.log('failed to cache required messages')
            })
    })

}

function fetchServerStatus() {
    return new Promise((resolve, reject) => {
        axios.get('https://api.mcsrvstat.us/2/mc.karanteeni.net')
            .then(function (response) {
                resolve(response.data)
            })
            .catch(function (error) {
                reject(error)
            });
    });
}

function updateServerStatus() {
    return new Promise(async (resolve, reject) => {
        let guild = client.guilds.cache.get(configuration.ID_MAP.GUILD)
        let playersOnServerChannel = guild.channels.cache.get(configuration.ID_MAP.CHANNELS.CURRENT_PLAYERS_ON_SERVER);
        let usersOnDiscordChannel = guild.channels.cache.get(configuration.ID_MAP.CHANNELS.ALL_PLAYERS_ON_DISCORD);

        let serverStatus = await fetchServerStatus();

        if (!cachedServerStatus || serverStatus.players.online !== cachedServerStatus.players.online) {
            if (!playersOnServerChannel.editable) {
                console.log("Unable to edit playersOnServerChannel")
            } else {
                playersOnServerChannel.edit({ name: "Pelaajia servulla: " + serverStatus.players.online })
                    .catch(err => console.log(err))
            }

        }

        if (!cachedMemberCount || guild.memberCount !== cachedMemberCount) {
            if (!usersOnDiscordChannel.editable) {
                console.log("Unable to edit usersOnDiscordChannel")
            } else {
                usersOnDiscordChannel.edit({ name: "Pelaajia discordissa: " + guild.memberCount })
                    .catch(err => console.log(err))
            }

        }

        cachedServerStatus = serverStatus;
        cachedMemberCount = guild.memberCount;

        resolve(true)
    })
}

function updateAutomatedRoles() {
    return new Promise(async (resolve, reject) => {
        let guild = client.guilds.cache.get(configuration.ID_MAP.GUILD)
        if (!guild) throw new Error("Client has an invalid MAIN_GUILD_ID")

        let channel = guild.channels.cache.get(configuration.ID_MAP.CHANNELS.CHANNEL_RULES)
        if (!channel) throw new Error("MAIN_GUILD does not have given channel as a part of it")

        let message = channel.messages.cache.get(configuration.ID_MAP.MESSAGES.RULE_REACTION_MESSAGE)
        if (!message) throw new Error("Did not find the ROLE_REACTION_MESSAGE")

        let playerRoles = await message.reactions.cache.get("✅").users.fetch()
        let notifyRoles = await message.reactions.cache.get("❗").users.fetch()

        playerRoles.each(player => {
            let member = guild.members.cache.get(player.id)
            if (!member) return;
            let roleName = "Pelaaja"
            let role = guild.roles.cache.find(role => role.name === roleName)
            if (member.roles.cache.find(role => role.name === roleName)) return;
            member.roles.add(role);
        })

        notifyRoles.each(player => {
            let member = guild.members.cache.get(player.id)
            if (!member) return;
            let roleName = "Ilmoitukset"
            let role = guild.roles.cache.find(role => role.name === roleName)
            if (member.roles.cache.find(role => role.name === roleName)) return;
            member.roles.add(role);
        })

        resolve(true)
    })
}



client.on('ready', async () => {

    // Cache messages required for updating roles
    await cacheRequiredMessages()

    // Update server status and add missing roles
    await updateServerStatus()
    await updateAutomatedRoles()


    // Update the info channel names in discord every 10 minutes
    let serverStatusScheduler = schedule.scheduleJob('*/10 * * * *', () => {
        updateServerStatus()
    });

    // Check that the bot has given necessary roles every hour
    let rolesUptodateScheduler = schedule.scheduleJob('* */1 * * *', () => {
        updateAutomatedRoles()
    });

    console.log(chalk.blue("//// Botti virallisesti hereillä."))
    console.log(chalk.blue("//// Käynnistyminen kesti"), chalk.red(Date.now() - startingDate), chalk.blue('ms'))
    console.log(chalk.blue("//// Discord serverillä yhteensä", chalk.yellow(cachedMemberCount), chalk.blue('pelaajaa')))
    console.log(chalk.blue("//// Minecraftissa tällä hetkellä", chalk.yellow(cachedServerStatus.players.online), chalk.blue('pelaajaa')))
    console.log(chalk.blue("//// Hirvitysfiltteri", hirvitysFiltteri ? chalk.yellow("päällä") : chalk.red("pois päältä")))
})

client.on('message', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('/komppaniassaherätys')) {
        message.author.send('Komppaniassa herätys! Ovet auki, valot päälle. Taistelijat ylös punkasta. Hyvää huomenta komppania! \n\nTämän viestin jätti Susse ollessaan armeijassa. Punkassa rötinä oli kova ja odotus lomille sitäkin suurempi. Hajoaminen oli lähellä.')
    }
    if (hirvitysFiltteri && message.deletable) {
        if (message.content.toLowerCase() === "ok" || message.content.toLowerCase() === "eiku") {
            message.delete({ reason: "stop, hirvitysfiltteri ei hyväksy" })
        }
    }


    if (message.content.startsWith('/hirvitysfiltteri')) {
        if (message.guild === null) return;

        if (!message.member.hasPermission("ADMINISTRATOR")) return;

        let args = message.content.trim().split(' ')

        if (args[1] == 'true' || args[1] == 'päälle' || args[1] == 'on') {
            hirvitysFiltteri = true
        } else if (args[1] == 'false' || args[1] == 'pois' || args[1] == 'off') {
            hirvitysFiltteri = false
        }

        if (hirvitysFiltteri) {
            message.channel.send('Hirvitysfiltteri o päällä bro')
        } else {
            message.channel.send('Hirvitysfiltteri ei oo päällä bro')
        }
    }

    if (message.content.startsWith('/sendmessage')) {
        let guild = client.guilds.cache.get(configuration.ID_MAP.GUILD)
        if (!guild) return;
        let member = guild.members.cache.get(message.author.id);
        if (!member) return;
        if (!member.hasPermission("ADMINISTRATOR")) return;

        let args = message.content.trim().split(' ')

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
    }
})

client.on("messageReactionAdd", (reaction, user) => {
    parseReaction({
        reaction: reaction,
        user: user,
        type: "ADD"
    })
})

client.on("messageReactionRemove", (reaction, user) => {
    parseReaction({
        reaction: reaction,
        user: user,
        type: "REMOVE"
    })
})

client.on('reconnecting', () => console.log("BOT RECONNECTING"))

client.on('resume', () => console.log("BOT RESUMED SUCCESFULLY"))

client.on('error', (err) => console.log("ERROR ON CLIENT:", err))

client.on('warn', (warn) => console.warn(warn))

process.on('uncaughtException', (err) => console.log("EXCEPTION ON PROCESS:", err))



client.login(authorize.token)