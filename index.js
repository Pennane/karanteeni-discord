process.chdir(__dirname)

let startingDate = Date.now()

const Discord = require('discord.js')
const schedule = require('node-schedule')
const chalk = require('chalk')

const configuration = require('./util/config')

const client = new Discord.Client()

const serverStatus = require('./server_status/status.js')
const reactionListeners = require('./reaction_handling/listeners.js')
const messageHandler = require('./message_handling/handler.js')
const twitchEmitter = require('./twitch_integration/twitch.js')
const twitchNotifier = require('./twitch_integration/notify.js')
const {
    cachedInteger,
    initializeGame,
    parseCountingGameMessageEdit,
    parseCountingGameMessageDelete
} = require('./count_up/index.js')

const countingGameChannel = configuration.DISCORD.ID_MAP.CHANNELS.COUNT_UP_GAME

function toggleRole(member, roleName, type) {
    let guild = member.guild

    if (configuration.DISCORD.ID_MAP.GUILD !== guild.id) throw new Error('Tried to toggle role for wrong guild')

    let role = guild.roles.cache.find((role) => role.name === roleName)

    if (!role) return console.error("Main guild does not have a role named '" + roleName + "'")

    if (type === 'ADD') {
        member.roles.add(role)
    } else if (type === 'REMOVE') {
        member.roles.remove(role)
    }
}

function updateAutomatedRoles() {
    return new Promise(async (resolve, reject) => {
        const guild = await client.guilds.fetch(configuration.DISCORD.ID_MAP.GUILD)

        if (!guild) throw new Error('Client has an invalid MAIN_GUILD_ID')

        reactionListeners.forEach(async (listener) => {
            let channel = await client.channels.fetch(listener.location.channel)
            if (!channel)
                return console.info(chalk.red(listener.name + ' uses a channel that does not exist in MAIN GUILD'))

            let message = await channel.messages.fetch(listener.location.message)
            if (!message) return console.info(chalk.red(listener.name + ' uses a message id that can not be found'))

            let reactionCache = message.reactions.cache.get(listener.emoji.id || listener.emoji.name)

            if (!reactionCache) {
                message.react(listener.emoji.id || listener.emoji.name)
                return
            }

            if (!reactionCache.me) {
                message.react(listener.emoji.id || listener.emoji.name)
            }

            let reactedUsers = await reactionCache.users.fetch()

            if (!reactedUsers) return

            let roleName = listener.role.name

            let role = guild.roles.cache.find((role) => role.name === roleName)

            if (!role) return console.info(chalk.red("Missing role '" + roleName + "'"))

            let memberCache = guild.members.cache

            reactedUsers.forEach((user) => {
                let member = memberCache.get(user.id)
                if (!member) return

                if (member.roles.cache.find((role) => role.name === roleName)) return

                member.roles.add(role)
            })
        })

        resolve(true)
    })
}

async function parseReaction(reaction) {
    let reactionListener = reactionListeners.find((listener) => {
        let correctChannel = listener.location.message === reaction.reaction.message.id
        let correctEmoji =
            reaction.reaction._emoji.id === null
                ? listener.emoji.name === reaction.reaction._emoji.name
                : listener.emoji.id === reaction.reaction._emoji.id
        return correctChannel && correctEmoji
    })

    if (!reactionListener) return

    const guild = await client.guilds.fetch(configuration.DISCORD.ID_MAP.GUILD)

    let member = guild.member(reaction.user)

    if (!member) return

    if (reaction.type === 'ADD') {
        toggleRole(member, reactionListener.role.name, 'ADD')
    } else if (reactionListener.role.removable && reaction.type === 'REMOVE') {
        toggleRole(member, reactionListener.role.name, 'REMOVE')
    }
}

function displayCachedNumberGame() {
    return new Promise(async (resolve, reject) => {
        try {
            const channel = await client.channels.fetch(configuration.DISCORD.ID_MAP.CHANNELS.COUNT_UP_GAME)
            await channel.send('`!!BOTTI ON KÄYNNISTETTY UUDESTAAN! BOTTI ILMOITTAA VIIMEISIMMÄN NUMERON!!`')
            await channel.send(cachedInteger())
        } catch (exception) {
            console.info(exception)
        } finally {
            resolve()
        }
    })
}

twitchEmitter.on('streamChange', async (data) => {
    if (!data || !data.user) return
    if (data.type !== 'online') return

    const guild = await client.guilds.fetch(configuration.DISCORD.ID_MAP.GUILD)

    let channel = await client.channels.fetch(configuration.DISCORD.ID_MAP.CHANNELS.TWITCH_NOTIFICATIONS)
    let role = guild.roles.cache.find((role) => role.name === 'Twitch')

    twitchNotifier.notify({
        streamChange: data,
        notifyRole: role,
        destination: channel
    })
})

client.on('ready', async () => {
    const guild = await client.guilds.fetch(configuration.DISCORD.ID_MAP.GUILD)

    // Update server status
    await serverStatus.update(guild)

    // Add missing roles
    await updateAutomatedRoles()

    // Start the counting game
    try {
        await initializeGame(client)
        if (true || process.env.NODE_ENV === 'production') {
            displayCachedNumberGame()
        }
    } catch (exception) {
        console.error(exception)
    }

    // Update the info channel names in discord every 10 minutes
    let serverStatusScheduler = schedule.scheduleJob('*/10 * * * *', () => {
        serverStatus.update(guild)
    })

    // Check that the bot has given necessary roles every hour
    let rolesUptodateScheduler = schedule.scheduleJob('* */2 * * *', () => {
        updateAutomatedRoles()
    })

    console.info(chalk.blue('//// Botti virallisesti hereillä.'))
    console.info(chalk.blue('//// Käynnistyminen kesti'), chalk.red(Date.now() - startingDate), chalk.blue('ms'))
    console.info(
        chalk.blue('//// Discord serverillä yhteensä', chalk.yellow(guild.memberCount), chalk.blue('pelaajaa'))
    )
    if (serverStatus.cached()) {
        console.info(
            chalk.blue(
                '//// Minecraftissa tällä hetkellä',
                chalk.yellow(serverStatus.cached().players.online),
                chalk.blue('pelaajaa')
            )
        )
    } else {
        console.info(chalk.red('//// Minecraft palvelin tuntuisi olevan pois päältä.'))
    }
})

client.on('message', async (message) => {
    const ignoreMessage = message.author.bot
    if (ignoreMessage) return
    messageHandler.parse(message, client)
})

client.on('messageUpdate', (oldMessage, newMessage) => {
    console.log(newMessage.content)
    if (newMessage.channel.id === countingGameChannel) {
        parseCountingGameMessageEdit(oldMessage, newMessage)
    }
})

client.on('messageDelete', (message) => {
    if (message.channel.id === countingGameChannel) {
        parseCountingGameMessageDelete(message)
    }
})

// Sends added reactions to be handled
client.on('messageReactionAdd', (reaction, user) => {
    if (user.bot) return
    parseReaction({
        reaction: reaction,
        user: user,
        type: 'ADD'
    })
})

// Sends removed reactions to be handled
client.on('guildMemberAdd', (member) => {
    if (member.user.bot) return
    toggleRole(member, 'Pelaaja', 'ADD')
})

client.on('messageReactionRemove', (reaction, user) => {
    if (user.bot) return
    parseReaction({
        reaction: reaction,
        user: user,
        type: 'REMOVE'
    })
})

client.on('reconnecting', () => console.info('BOT RECONNECTING'))

client.on('resume', () => console.info('BOT RESUMED SUCCESFULLY'))

client.on('error', (err) => console.info('ERROR ON CLIENT:', err))

client.on('warn', (warn) => console.warn(warn))

process.on('uncaughtException', (err) => console.info('UNCAUGHT EXCEPTION ON PROCESS:', err))

client.login(configuration.DISCORD.TOKEN)
