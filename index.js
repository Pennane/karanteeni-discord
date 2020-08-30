process.chdir(__dirname)

let startingDate = Date.now()

const schedule = require('node-schedule')
const Discord = require('discord.js')
const chalk = require('chalk')
const axios = require('axios').default;

const configuration = require('./configuration.json')
const authorize = require('./authorize.json')

const client = new Discord.Client()

const reactionListeners = require('./reaction_handling/listeners.js')

let cachedMinecraftServerStatus = null;
let cachedMemberCount = null;

function fetchMinecraftServerStatus() {
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

function updateMinecraftServerStatus() {
    return new Promise(async (resolve, reject) => {
        let guild = client.guilds.cache.get(configuration.ID_MAP.GUILD)

        let playersOnMinecraftServerChannel = guild.channels.cache.get(configuration.ID_MAP.CHANNELS.CURRENT_PLAYERS_ON_MINECRAFT_SERVER);
        let usersOnDiscordChannel = guild.channels.cache.get(configuration.ID_MAP.CHANNELS.ALL_PLAYERS_ON_DISCORD);

        let minecraftServerStatus = await fetchMinecraftServerStatus();

        if (!playersOnMinecraftServerChannel.editable || !usersOnDiscordChannel.editable) {
            return console.log("Unable to edit required channels. Aborting.")
        }

        if (minecraftServerStatus && minecraftServerStatus.online === true && (!cachedMinecraftServerStatus || minecraftServerStatus.players.online !== cachedMinecraftServerStatus.players.online)) {
            playersOnMinecraftServerChannel.edit({ name: "Pelaajia servulla: " + minecraftServerStatus.players.online })
                .catch(err => console.log(err))
        } else if (minecraftServerStatus && minecraftServerStatus.online === false && cachedMinecraftServerStatus.online !== false) {
            playersOnMinecraftServerChannel.edit({ name: "Palvelin poissa päältä" })
                .catch(err => console.log(err))
        } else if (!minecraftServerStatus && cachedMinecraftServerStatus) {
            playersOnMinecraftServerChannel.edit({ name: "Pelaajia servulla: ?" })
                .catch(err => console.log(err))
        }

        if (!cachedMemberCount || guild.memberCount !== cachedMemberCount) {
            usersOnDiscordChannel.edit({ name: "Pelaajia discordissa: " + guild.memberCount })
                .catch(err => console.log(err))
        }

        cachedMinecraftServerStatus = minecraftServerStatus;
        cachedMemberCount = guild.memberCount;

        resolve(true)
    })
}

function cacheRequiredMessages() {
    return new Promise((resolve, reject) => {
        let promises = []

        reactionListeners.forEach(listener => {
            let channel = client.channels.cache.get(listener.location.channel)
            let promise = channel.messages.fetch(listener.location.message)
                .catch(error => console.log('failed to cache required messages', error));
            promises.push(promise)
        })

        Promise.all(promises)
            .then(values => {
                resolve()
            })
            .catch(error => console.log('failed to cache required messages', error));
    })
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

function parseReaction(reaction) {
    let reactionListener = reactionListeners.find(listener => {
        let correctChannel = listener.location.message === reaction.reaction.message.id;
        let correctEmoji = reaction.reaction._emoji.id === null ? listener.emoji.name === reaction.reaction._emoji.name : listener.emoji.id === reaction.reaction._emoji.id

        return correctChannel && correctEmoji;
    })

    if (!reactionListener) return;

    if (reaction.type === "ADD") {
        toggleRole(reaction.user, reactionListener.role.name, "ADD")
    } else if (reactionListener.role.removable && reaction.type === "REMOVE") {
        toggleRole(reaction.user, reactionListener.role.name, "REMOVE")
    }

}

function updateAutomatedRoles() {
    return new Promise(async (resolve, reject) => {
        let guild = client.guilds.cache.get(configuration.ID_MAP.GUILD)
        if (!guild) throw new Error("Client has an invalid MAIN_GUILD_ID")

        reactionListeners.forEach(async listener => {
            let channel = guild.channels.cache.get(listener.location.channel)
            if (!channel) return console.log(chalk.red(listener.name + " uses a channel that does not exist in MAIN GUILD"))

            let message = channel.messages.cache.get(listener.location.message)
            if (!message) return console.log(chalk.red(listener.name + " uses a message id that can not be found"))

            let reactionCache = message.reactions.cache.get(listener.emoji.id || listener.emoji.name)

            if (!reactionCache) {
                message.react(listener.emoji.id || listener.emoji.name)
                return;
            }

            if (!reactionCache.me) {
                message.react(listener.emoji.id || listener.emoji.name)
            }

            let reactedUsers = await reactionCache.users.fetch()

            if (!reactedUsers) return;

            reactedUsers.forEach(user => {
                let member = guild.members.cache.get(user.id)
                if (!member) return;

                let roleName = listener.role.name;

                let role = guild.roles.cache.find(role => role.name === roleName)

                if (!role) return console.log(chalk.red("Missing role '" + roleName + "'"))

                if (member.roles.cache.find(role => role.name === roleName)) return;

                member.roles.add(role);
            })
        })

        resolve(true)
    })
}

client.on('ready', async () => {

    // Cache messages required for updating roles
    await cacheRequiredMessages()

    // Update server status and add missing roles
    // await updateMinecraftServerStatus()
    await updateAutomatedRoles()

    // Update the info channel names in discord every 10 minutes
    let serverStatusScheduler = schedule.scheduleJob('*/10 * * * *', () => {
        updateMinecraftServerStatus()
    });

    // Check that the bot has given necessary roles every hour
    let rolesUptodateScheduler = schedule.scheduleJob('* */1 * * *', () => {
        updateAutomatedRoles()
    });

    console.log(chalk.blue("//// Botti virallisesti hereillä."))
    console.log(chalk.blue("//// Käynnistyminen kesti"), chalk.red(Date.now() - startingDate), chalk.blue('ms'))
    console.log(chalk.blue("//// Discord serverillä yhteensä", chalk.yellow(cachedMemberCount), chalk.blue('pelaajaa')))
    if (cachedMinecraftServerStatus) {
        console.log(chalk.blue("//// Minecraftissa tällä hetkellä", chalk.yellow(cachedMinecraftServerStatus.players.online), chalk.blue('pelaajaa')))
    } else {
        console.log(chalk.red("//// Minecraftissa palvelin tuntuisi olevan pois päältä."))
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

process.on('uncaughtException', (err) => console.log("UNCAUGHT EXCEPTION ON PROCESS:", err))



client.login(authorize.token)