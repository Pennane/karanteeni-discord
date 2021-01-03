process.chdir(__dirname)

let startingDate = Date.now()

const Discord = require('discord.js')
const schedule = require('node-schedule')
const chalk = require('chalk')

const configuration = require('./configuration.json')
const authorize = require('./authorize.json')

const client = new Discord.Client()

const serverStatus = require('./server_status/status.js')
const reactionListeners = require('./reaction_handling/listeners.js')
const messageHandler = require('./message_handling/handler.js')
const twitchEmitter = require('./twitch_integration/twitch.js')
const twitchNotifier = require('./twitch_integration/notify.js')
const { cachedInteger } = require('./count_up/index.js')

let DEBUG_REACT_COUNT = 0;

// Caches required messages for automated role updating from reactions
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
            .then(() => resolve())
            .catch(error => console.log('failed to cache required messages', error));
    })
}


function toggleRole(member, roleName, type) {
    let guild = member.guild;

    if (configuration.DISCORD.ID_MAP.GUILD !== guild.id) throw new Error("Tried to toggle role for wrong guild")

    let role = guild.roles.cache.find(role => role.name === roleName)

    if (!role) throw new Error("Main guild does not have a role named '" + roleName + "'")

    if (type === "ADD") {
        member.roles.add(role);
    } else if (type === "REMOVE") {
        member.roles.remove(role);
    }
}

function updateAutomatedRoles() {
    return new Promise(async (resolve, reject) => {
        const guild = client.guilds.cache.get(configuration.DISCORD.ID_MAP.GUILD)

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

            let roleName = listener.role.name;

            let role = guild.roles.cache.find(role => role.name === roleName)

            if (!role) return console.log(chalk.red("Missing role '" + roleName + "'"))

            let memberCache = guild.members.cache;

            reactedUsers.forEach(user => {
                let member = memberCache.get(user.id)
                if (!member) return;

                if (member.roles.cache.find(role => role.name === roleName)) return;

                member.roles.add(role);
            })
        })

        resolve(true)
    })
}

function parseReaction(reaction) {
    let reactionListener = reactionListeners.find(listener => {
        let correctChannel = listener.location.message === reaction.reaction.message.id;
        let correctEmoji = reaction.reaction._emoji.id === null ? listener.emoji.name === reaction.reaction._emoji.name : listener.emoji.id === reaction.reaction._emoji.id
        return correctChannel && correctEmoji;
    })

    if (!reactionListener) return;

    if (reactionListener.name === "rulesReadRole") {
        let reactCount = reaction.count;
        if (reactCount > DEBUG_REACT_COUNT + 1 && DEBUG_REACT_COUNT !== 0) {
            console.err('bot has missed a react, who knows why')
        }
        DEBUG_REACT_COUNT = reactCount
    }

    const guild = client.guilds.cache.get(configuration.DISCORD.ID_MAP.GUILD)

    let member = guild.member(reaction.user);

    if (!member) return;

    if (reaction.type === "ADD") {
        toggleRole(member, reactionListener.role.name, "ADD")
    } else if (reactionListener.role.removable && reaction.type === "REMOVE") {
        toggleRole(member, reactionListener.role.name, "REMOVE")
    }
}

function loadCachedNumberGame() {
    return new Promise(async (resolve, reject) => {
        const guild = await client.guilds.cache.get(configuration.DISCORD.ID_MAP.GUILD)
        const channel = guild.channels.cache.get(configuration.DISCORD.ID_MAP.CHANNELS.COUNT_UP_GAME)
        channel.send('`!!BOTTI ON KÄYNNISTETTY UUDESTAAN! BOTTI ILMOITTAA VIIMEISIMMÄN NUMERON!!`').then(message => {
            channel.send(cachedInteger())
        }).catch(err => console.log(err))
        resolve()
    })
}


twitchEmitter.on('streamChange', (data) => {
    if (!data || !data.user) return;
    if (data.type !== "online") return;

    const guild = client.guilds.cache.get(configuration.DISCORD.ID_MAP.GUILD)

    let channel = guild.channels.cache.get(configuration.DISCORD.ID_MAP.CHANNELS.TWITCH_NOTIFICATIONS)
    let role = guild.roles.cache.find(role => role.name === "Twitch")

    twitchNotifier.notify({
        streamChange: data,
        notifyRole: role,
        destination: channel
    })
})

client.on('ready', async () => {
    const guild = await client.guilds.cache.get(configuration.DISCORD.ID_MAP.GUILD)

    // Cache messages required for updating roles
    await cacheRequiredMessages()

    // Send cached number from the number game
    await loadCachedNumberGame()

    // Update server status 
    await serverStatus.update(guild)

    // Add missing roles
    await updateAutomatedRoles()

    // Update the info channel names in discord every 10 minutes
    let serverStatusScheduler = schedule.scheduleJob('*/10 * * * *', () => {
        serverStatus.update(guild)
    });

    // Check that the bot has given necessary roles every hour
    let rolesUptodateScheduler = schedule.scheduleJob('* */2 * * *', () => {
        updateAutomatedRoles()
    });

    console.log(chalk.blue("//// Botti virallisesti hereillä."))
    console.log(chalk.blue("//// Käynnistyminen kesti"), chalk.red(Date.now() - startingDate), chalk.blue('ms'))
    console.log(chalk.blue("//// Discord serverillä yhteensä", chalk.yellow(guild.memberCount), chalk.blue('pelaajaa')))
    if (serverStatus.cached()) {
        console.log(chalk.blue("//// Minecraftissa tällä hetkellä", chalk.yellow(serverStatus.cached().players.online), chalk.blue('pelaajaa')))
    } else {
        console.log(chalk.red("//// Minecraft palvelin tuntuisi olevan pois päältä."))
    }
})

client.on('message', async (message) => {
    const ignoreMessage = message.author.bot;
    if (ignoreMessage) return;
    messageHandler.parse(message, client)
})

// Sends added reactions to be handled
client.on("messageReactionAdd", (reaction, user) => {
    if (user.bot) return;
    parseReaction({
        reaction: reaction,
        user: user,
        type: "ADD"
    })
})

// Sends removed reactions to be handled
client.on("guildMemberAdd", (member) => {
    if (member.user.bot) return;
    toggleRole(member, 'Pelaaja', 'ADD')
})

client.on("messageReactionRemove", (reaction, user) => {
    if (user.bot) return;
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


client.login(authorize.discord.token)