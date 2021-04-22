import configuration from '../util/config'
import fs from 'fs/promises'
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

const initializeData = async () => {
    let dataLocation = configuration.COUNTING_GAME.DATA_LOCATION
    let file
    try {
        file = await fs.open(dataLocation, 'r')
    } catch {
        await fs.writeFile(dataLocation, '{"lastSavedInteger": 0, "highestAchievedInteger": 0}')
    } finally {
        if (file) file.close()
    }

    cache = JSON.parse(await fs.readFile(dataLocation, 'utf8'))

    if (cache.lastSavedInteger) {
        currentNumber = cache.lastSavedInteger
    }
}

initializeData()

const resetGame = (
    member: Discord.GuildMember | null,
    customMessage: string | null,
    destination: Discord.Channel | null,
    messageHandledAlready?: boolean
) => {
    if (!messageHandledAlready) {
        sendResetMessage(destination as Discord.TextChannel, member as Discord.GuildMember, customMessage)
    }
    currentNumber = 0
    userBuffer = []
}

const saveValue = async (value: number) => {
    cache.lastSavedInteger = value
    currentNumber = value
    if (!cache.highestAchievedInteger || value > cache.highestAchievedInteger) {
        cache.highestAchievedInteger = value
    }
    await fs.writeFile(configuration.COUNTING_GAME.DATA_LOCATION, JSON.stringify(cache))
}

const handleMessageEdit = (oldMessage: Discord.Message, newMessage: Discord.Message) => {
    if (newMessage.author.bot || currentNumber === 0) return

    let oldInteger = parseInt(oldMessage.content)
    let newInteger = parseInt(newMessage.content)
    if (!oldInteger || oldInteger > currentNumber || oldInteger === newInteger) return
    const userId = newMessage?.member?.user?.id
    let embed = new Discord.MessageEmbed()
        .setColor(0xf44242)
        .setTitle('Takas nollaan että läsähti!')
        .addField('Vanha arvo:', oldInteger, true)
        .addField('Uusi arvo:', newInteger, true)
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
            /* Sent message did not start with number */
            message.delete()
            resetGame(member, 'pelkkiä lukuja chattiin', channel)
        } else if (userBuffer.indexOf(member.id) !== -1 && currentNumber !== 0) {
            /* Sent message was from user in userbuffer */
            resetGame(member, `anna vähintään ${maxUserBufferLength} pelaajan nostaa lukua ensin`, channel)
        } else if (sentInteger !== currentNumber + 1 && currentNumber > 1) {
            /* Sent message had wrong next number */
            resetGame(member, null, channel)
        } else if (sentInteger === currentNumber + 1 && userBuffer.indexOf(member.id) === -1) {
            /* SENT MESSAGE WAS CORRECT FOR ONCE*/
            currentNumber++
            userBuffer.unshift(member.id)
        }

        if (!cache.highestAchievedInteger || sentInteger > cache.highestAchievedInteger) {
            /* Save highest achieved number to achievement channel in discord */
            pushHighestAchievedNumber(sentInteger, achievementChannel as Discord.TextChannel)
        }

        /* Find possible achievements and update achievement channel */
        findAndGiveAchievements(currentNumber, message, achievementChannel as Discord.TextChannel)

        if (cache.lastSavedInteger !== currentNumber) {
            saveValue(currentNumber)
        }

        /* Reduce userbuffer to max length */
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
