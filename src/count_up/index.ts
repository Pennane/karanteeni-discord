import configuration from '../util/config'
import fs from 'fs'
import Discord from 'discord.js'

import { ValueReturner } from '../commands/command_files/returnvalue.js'
import { SpecialMessages } from '../message_handling/handler.js'

import { pushHighestAchievedNumber, sendCountingStartsAtOne, sendResetMessage, findAndGiveAchievements } from './util'

interface CountingGameCache {
    lastSavedInteger?: number
    highestAchievedInteger?: number
}

type UserBuffer = Array<string>

let cache: CountingGameCache
let currentNumber = 0
let maxUserBufferLength = 2
let userBuffer: UserBuffer = []

const initializeData = () => {
    let dataLocation = configuration.COUNTING_GAME.DATA_LOCATION
    if (!fs.existsSync(dataLocation)) {
        fs.writeFileSync(dataLocation, '{"lastSavedInteger": 0, "highestAchievedInteger": 0}')
    }

    cache = JSON.parse(fs.readFileSync(dataLocation, 'utf8'))

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
        sendResetMessage(destination, member, customMessage)
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

const execute = (client: Discord.Client) => {
    return new Promise(async (resolve, reject) => {
        const gameChannel = await client.channels.fetch(configuration.DISCORD.ID_MAP.CHANNELS.COUNT_UP_GAME)
        const achievementChannel = await client.channels.fetch(
            configuration.DISCORD.ID_MAP.CHANNELS.COUNT_UP_ACHIEVEMENTS
        )

        if (!gameChannel || !achievementChannel) {
            return reject(new Error('Missing required DISCORD content'))
        }

        const handleGameMessage = (message: Discord.Message) => {
            let { content, channel, member } = message
            let sentInteger = parseInt(content)
            message.type

            if (currentNumber === 0 && sentInteger !== 1 && !isNaN(sentInteger)) {
                sendCountingStartsAtOne(channel, message)
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

            /* Find possible achievements and update achievement channel */
            findAndGiveAchievements(currentNumber, message, achievementChannel)

            if (!cache.highestAchievedInteger || sentInteger > cache.highestAchievedInteger) {
                /* Save highest achieved number to achievement channel in discord */
                pushHighestAchievedNumber(sentInteger, achievementChannel)
            }

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

        resolve()
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
