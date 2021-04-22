import configuration from '../util/config'
import fs from 'fs'
import Discord from 'discord.js'

import { ValueReturner } from '../commands/command_files/returnvalue'
import { SpecialMessages } from '../message_handling/handler'

import { pushHighestAchievedNumber, sendCountingStartsAtOne, sendResetMessage, findAndGiveAchievements } from './util'

interface CountingGameCache {
    lastSavedInteger?: number
    highestAchievedInteger?: number
}

type UserId = string
type UserBuffer = Array<UserId>

let cache: CountingGameCache
let currentNumber = 0
let maxUserBufferLength = 2

let userBuffer: UserBuffer = []

const saveFailure = (id: string): void => {
    let destination = configuration.COUNTING_GAME.FAILURE_LOCATION

    if (!fs.existsSync(destination)) {
        fs.writeFileSync(destination, '{}')
    }

    let failureData = JSON.parse(fs.readFileSync(destination, 'utf8'))
    failureData[id] = failureData[id] ? failureData[id] + 1 : 1
    fs.writeFileSync(destination, JSON.stringify(failureData))
}

const initializeData = () => {
    let destination = configuration.COUNTING_GAME.DATA_LOCATION
    if (!fs.existsSync(destination)) {
        fs.writeFileSync(destination, '{"lastSavedInteger": 0, "highestAchievedInteger": 0}')
    }

    cache = JSON.parse(fs.readFileSync(destination, 'utf8'))

    if (cache.lastSavedInteger) {
        currentNumber = cache.lastSavedInteger
    }
}

initializeData()

const resetGame = (member: Discord.GuildMember | null, customMessage: string | null, destination: Discord.Channel | null, messageHandledAlready?: boolean) => {
    if (process.env.NODE_ENV === 'production' && member?.id && currentNumber > 10) {
        saveFailure(member.id)
    }

    if (!messageHandledAlready) {
        sendResetMessage(destination as Discord.TextChannel, member as Discord.GuildMember, customMessage)
    }

    currentNumber = 0
    userBuffer = []
}

const saveValue = (value: number) => {
    cache.lastSavedInteger = value
    currentNumber = value
    if (!cache.highestAchievedInteger || value > cache.highestAchievedInteger) {
        cache.highestAchievedInteger = value
    }
    fs.writeFile(configuration.COUNTING_GAME.DATA_LOCATION, JSON.stringify(cache), function (err) {
        if (err) {
            return console.info(err)
        }
    })
}

const handleMessageEdit = (oldMessage: Discord.Message, newMessage: Discord.Message) => {
    if (newMessage.author.bot || currentNumber === 0) return

    let oldInteger = parseInt(oldMessage.content)
    let newInteger = parseInt(newMessage.content)

    if (!oldInteger || oldInteger > currentNumber || oldInteger === newInteger) return

    const userId = newMessage?.member?.user?.id

    let embed = new Discord.MessageEmbed().setColor(0xf44242).setTitle('Takas nollaan että läsähti!').addField('Vanha arvo:', oldInteger, true).addField('Uusi arvo:', newInteger, true)

    if (userId) {
        embed.setDescription(`<@${userId}> vaihtoi viestin arvoa.`)
    } else {
        embed.setDescription(`Joku vaihtoi viestin arvoa.`)
    }

    newMessage.channel.send(embed)
    resetGame(newMessage.member, null, null, true)
    saveValue(0)
}

const handleMessageDelete = (message: Discord.Message) => {
    if (message.author.bot || currentNumber === 0) return
    let removedInteger = parseInt(message.content)
    if (!removedInteger || removedInteger > currentNumber || removedInteger < currentNumber - 3) return
    const userId = message?.member?.user?.id
    let embed = new Discord.MessageEmbed()
        .setColor(0xf44242)
        .setTitle('Takas nollaan että läsähti!')

        .addField('Poistettu arvo oli:', removedInteger, true)

    if (userId) {
        embed.setDescription(`<@${userId}> poisti liian uuden viestin.`)
    } else {
        embed.setDescription(`Joku poisti liian uuden viestin.`)
    }
    message.channel.send(embed)
    resetGame(message.member, null, null, true)
    saveValue(0)
}

const execute = async (client: Discord.Client): Promise<void> => {
    const gameChannel = await client.channels.fetch(configuration.DISCORD.ID_MAP.CHANNELS.COUNT_UP_GAME)
    const achievementChannel = await client.channels.fetch(configuration.DISCORD.ID_MAP.CHANNELS.COUNT_UP_ACHIEVEMENTS)

    if (!gameChannel || !achievementChannel) {
        throw new Error('Missing required DISCORD content')
    }

    const handleGameMessage = (message: Discord.Message) => {
        let { content, channel, member } = message
        let sentInteger = parseInt(content)

        if (currentNumber === 0 && sentInteger !== 1 && !isNaN(sentInteger)) {
            sendCountingStartsAtOne(channel as Discord.TextChannel, message)
        }

        if (!member) return

        if (!member.hasPermission('ADMINISTRATOR') && isNaN(sentInteger)) {
            /* Message does not start with a number */
            message.delete()
            resetGame(member, 'pelkkiä lukuja chattiin', channel)
        } else if (userBuffer.includes(member.id) && currentNumber !== 0) {
            /* Message is from user in the old userbuffer */
            resetGame(member, `anna vähintään ${maxUserBufferLength} pelaajan nostaa lukua ensin`, channel)
        } else if (sentInteger !== currentNumber + 1 && currentNumber > 1) {
            /*  Message has wrong number */
            resetGame(member, null, channel)
        } else if (sentInteger === currentNumber + 1 && !userBuffer.includes(member.id)) {
            /* VALUE IS VALID*/
            currentNumber++
            userBuffer.unshift(member.id)
        }

        if (!cache.highestAchievedInteger || sentInteger > cache.highestAchievedInteger) {
            pushHighestAchievedNumber(sentInteger, achievementChannel as Discord.TextChannel)
        }

        findAndGiveAchievements(currentNumber, message, achievementChannel as Discord.TextChannel)

        if (cache.lastSavedInteger !== currentNumber) {
            saveValue(currentNumber)
        }

        /* Clamp userbuffer to max length */
        while (userBuffer.length > maxUserBufferLength) {
            userBuffer.pop()
        }
    }

    SpecialMessages.on('countingGameMessage', (message: Discord.Message) => handleGameMessage(message))

    ValueReturner.on('returnedValue', (value) => {
        saveValue(value)
        userBuffer = []
    })
}

const countingGame = {
    current: () => currentNumber,
    cachedInteger: () => cache.lastSavedInteger,
    highestAchievedInteger: () => cache.highestAchievedInteger,
    initializeGame: execute,
    parseCountingGameMessageEdit: handleMessageEdit,
    parseCountingGameMessageDelete: handleMessageDelete
}
export default countingGame
