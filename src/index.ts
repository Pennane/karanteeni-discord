process.chdir(__dirname)
import Discord from 'discord.js'
import schedule from 'node-schedule'
import chalk from 'chalk'
import configuration from './util/config'
import { toggleRole } from './util/discordutil'
import serverStatus from './server_status/status'
import messageHandler from './message_handling/handler'
import twitchEmitter from './twitch_integration/twitch'
import twitchNotifier from './twitch_integration/notify'
import countingGame from './count_up/index'

import { handle as handleReaction } from './reaction_handling/index'
import { init as initializeModeration, currentBan } from './moderation/index'
import { init as initializeSendMessage } from './send_message/index'

let startingDate = Date.now()
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER'] })

const countingGameChannel = configuration.DISCORD.ID_MAP.CHANNELS.COUNT_UP_GAME

import commandData from './commands/loader'
import fs from 'fs/promises'

const createCommandMap = async () => {
    let { commands } = await commandData()
    let commandMetaMap: {}[] = []
    commands.forEach((command) => {
        commandMetaMap.push(command._configuration)
    })

    await fs.writeFile(__dirname + '/../commandMetaMap.json', JSON.stringify(commandMetaMap))
}

createCommandMap()

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

        if (!role) return console.error('Missing twitch role, cannnot send notification.')

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

        initializeModeration(client)

        initializeSendMessage(client)

        // Update server status
        await serverStatus.update(guild)

        // Start the counting game
        try {
            await countingGame.initializeGame(client)
            if (process.env.NODE_ENV === 'production') {
                displayCachedNumberGame()
            }
        } catch (exception) {
            console.error(exception)
        }

        // Update the info channel names in discord every 10 minutes
        schedule.scheduleJob('*/10 * * * *', () => {
            serverStatus.update(guild)
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

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.partial) {
        // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
        try {
            await reaction.fetch()
        } catch (error) {
            console.error('Something went wrong when fetching the message: ', error)
            // Return as `reaction.message.author` may be undefined/null
            return
        }
    }
    if (!user || user.bot || user.partial) return
    handleReaction({
        client: client,
        reaction: reaction,
        user: user,
        type: 'ADD'
    })
})

// Sends removed reactions to be handled

client.on('messageReactionRemove', async (reaction, user) => {
    if (reaction.partial) {
        // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
        try {
            await reaction.fetch()
        } catch (error) {
            console.error('Something went wrong when fetching the message: ', error)
            // Return as `reaction.message.author` may be undefined/null
            return
        }
    }

    if (!user || user.bot || user.partial) return
    handleReaction({
        client: client,
        reaction: reaction,
        user: user,
        type: 'REMOVE'
    })
})

client.on('guildMemberAdd', async (member) => {
    if (member.user.bot) return
    const banned = await currentBan(member.id)
    if (!banned) {
        toggleRole(member, 'Pelaaja', 'ADD')
    } else {
        console.log(member.id + ' joined while banned. Did not receive pelaaja role')
    }
})

client.on('error', (err) => console.info('ERROR ON CLIENT:', err))

client.on('warn', (warn) => console.warn(warn))

process.on('uncaughtException', (err) => console.info('UNCAUGHT EXCEPTION ON PROCESS:', err))

client.login(configuration.DISCORD.TOKEN)
