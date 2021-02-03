process.chdir(__dirname)
import Discord from 'discord.js'
import schedule from 'node-schedule'
import chalk from 'chalk'
import configuration from './util/config'
import serverStatus from './server_status/status'
import reactionListeners, { ReactionListener } from './reaction_handling/listeners'
import messageHandler from './message_handling/handler'
import twitchEmitter from './twitch_integration/twitch'
import twitchNotifier from './twitch_integration/notify'
import countingGame from './count_up/index'

let startingDate = Date.now()
const client = new Discord.Client()

const countingGameChannel = configuration.DISCORD.ID_MAP.CHANNELS.COUNT_UP_GAME

const toggleRole = (member: Discord.GuildMember, roleName: string, type: 'ADD' | 'REMOVE'): void => {
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

const updateAutomatedRoles = async (): Promise<void> => {
    const guild = await client.guilds.fetch(configuration.DISCORD.ID_MAP.GUILD)

    if (!guild) throw new Error('Client has an invalid MAIN_GUILD_ID')

    reactionListeners.forEach(
        async (listener: ReactionListener): Promise<void> => {
            let channel = await client.channels.fetch(listener.location.channel)
            if (!channel)
                return console.info(chalk.red(listener.name + ' uses a channel that does not exist in MAIN GUILD'))

            if (channel.type !== 'text') throw new Error('Tried to pass a channel that is not a text channel')

            let message = await (channel as Discord.TextChannel).messages.fetch(listener.location.message)

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

            if (!role || role === undefined) return console.info(chalk.red("Missing role '" + roleName + "'"))

            let memberCache = guild.members.cache

            reactedUsers.forEach((user) => {
                let member = memberCache.get(user.id)
                if (!member) return

                if (member.roles.cache.find((role) => role.name === roleName)) return

                if (role) {
                    member.roles.add(role)
                }
            })
        }
    )
}

interface ReactionParseInput {
    reaction: Discord.MessageReaction
    user: Discord.User
    type: 'ADD' | 'REMOVE'
}

const parseReaction = async (parse: ReactionParseInput): Promise<void> => {
    let reactionListener = reactionListeners.find((listener) => {
        let correctChannel = listener.location.message === parse.reaction.message.id
        let correctEmoji =
            parse.reaction.emoji.id === null
                ? listener.emoji.name === parse.reaction.emoji.name
                : listener.emoji.id === parse.reaction.emoji.id
        return correctChannel && correctEmoji
    })

    if (!reactionListener) return

    const guild = await client.guilds.fetch(configuration.DISCORD.ID_MAP.GUILD)

    const user = parse.user

    if (!user) return

    let member = guild.member(user)

    if (!member) return

    if (parse.type === 'ADD') {
        toggleRole(member, reactionListener.role.name, 'ADD')
    } else if (reactionListener.role.removable && parse.type === 'REMOVE') {
        toggleRole(member, reactionListener.role.name, 'REMOVE')
    }
}

const displayCachedNumberGame = async (): Promise<void> => {
    try {
        const channel = (await client.channels.fetch(
            configuration.DISCORD.ID_MAP.CHANNELS.COUNT_UP_GAME
        )) as Discord.TextChannel
        if (!channel) throw new Error('Number Game Channel missing')
        if (channel.type !== 'text') throw new Error('Tried to pass a channel that is not a text channel')

        const cachedNumber = countingGame.cachedInteger()
        if (cachedNumber) {
            await channel.send('`!!BOTTI ON KÄYNNISTETTY UUDESTAAN! BOTTI ILMOITTAA VIIMEISIMMÄN NUMERON!!`')
            await channel.send(cachedNumber)
        } else {
            await channel.send('`!!BOTTI ON KÄYNNISTETTY UUDESTAAN ILMAN TALLENNETTUA NUMEROA`')
        }
    } catch (exception) {
        console.info(exception)
    }
}

twitchEmitter.on(
    'streamChange',
    async (data): Promise<void> => {
        if (!data || !data.user) return
        if (data.type !== 'online') return

        const guild = await client.guilds.fetch(configuration.DISCORD.ID_MAP.GUILD)

        let channel = await client.channels.fetch(configuration.DISCORD.ID_MAP.CHANNELS.TWITCH_NOTIFICATIONS)
        let role = guild.roles.cache.find((role) => role.name === 'Twitch')

        if (!role) return console.log('Missing twitch role, cannnot send notification.')

        twitchNotifier({
            streamChange: data,
            role: role,
            destination: channel
        })
    }
)

client.on(
    'ready',
    async (): Promise<void> => {
        const guild = await client.guilds.fetch(configuration.DISCORD.ID_MAP.GUILD)

        // Update server status

        serverStatus.update(guild)

        // Add missing roles
        updateAutomatedRoles()

        // Start the counting game
        try {
            await countingGame.initializeGame(client)
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
    }
)

client.on('message', (message) => {
    const ignoreMessage = message.author.bot
    if (ignoreMessage) return
    messageHandler.parse(message, client)
})

client.on('messageUpdate', (oldMessage, newMessage) => {
    if (!oldMessage || oldMessage.partial) return
    if (!newMessage || newMessage.partial) return

    if (newMessage.channel.id === countingGameChannel) {
        countingGame.parseCountingGameMessageEdit(oldMessage, newMessage)
    }
})

client.on('messageDelete', (message) => {
    if (!message || message.partial) return
    if (message.channel.id == countingGameChannel) {
        countingGame.parseCountingGameMessageDelete(message)
    }
})

// Sends added reactions to be handled

client.on('messageReactionAdd', (reaction, user) => {
    if (!user || user.bot || user.partial) return

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
    if (!user || user.bot || user.partial) return
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
