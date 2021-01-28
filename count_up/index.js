const configuration = require('../util/config')
const fs = require('fs')
const Discord = require('discord.js')

const { ValueReturner } = require('../commands/command_files/returnvalue.js')
const { specialMessages } = require('../message_handling/handler.js')

const {
    pushHighestAchievedNumber,
    sendCountingStartsAtOne,
    sendResetMessage,
    findAndGiveAchievements
} = require('./util')

let cache
let currentNumber = 0
let maxUserBufferLength = 2
let userBuffer = []

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

const resetGame = (member, customMessage, destination, messageHandledAlready) => {
    if (!messageHandledAlready) {
        sendResetMessage(destination, member, customMessage)
    }
    currentNumber = 0
    userBuffer = []
}

const saveValue = (value) => {
    cache.lastSavedInteger = value
    currentNumber = value
    if (value > cache.highestAchievedInteger) {
        cache.highestAchievedInteger = value
    }
    fs.writeFile(configuration.COUNTING_GAME.DATA_LOCATION, JSON.stringify(cache), function (err) {
        if (err) {
            return console.info(err)
        }
    })
}

const handleMessageEdit = (oldMessage, newMessage) => {
    if (newMessage.author.bot || currentNumber === 0) return

    let oldInteger = parseInt(oldMessage.content)
    let newInteger = parseInt(newMessage.content)
    if (!oldInteger || oldInteger > currentNumber || oldInteger === newInteger) return
    let embed = new Discord.MessageEmbed()
        .setColor(0xf44242)
        .setTitle('Takas nollaan että läsähti!')
        .setDescription(`<@${newMessage.member.user.id}> vaihtoi viestin arvoa.`)
        .addField('Vanha arvo:', oldInteger, true)
        .addField('Uusi arvo:', newInteger, true)
    newMessage.channel.send(embed)
    resetGame(newMessage.member, null, null, true)
    saveValue(0)
}

const handleMessageDelete = (message) => {
    if (message.author.bot || currentNumber === 0) return
    let removedInteger = parseInt(message.content)
    if (!removedInteger || removedInteger > currentNumber || removedInteger < currentNumber - 3) return

    let embed = new Discord.MessageEmbed()
        .setColor(0xf44242)
        .setTitle('Takas nollaan että läsähti!')
        .setDescription(`<@${message.member.user.id}> poisti liian uuden viestin.`)
        .addField('Poistettu arvo oli:', removedInteger, true)
    message.channel.send(embed)
    resetGame(message.member, null, null, true)
    saveValue(0)
}

const execute = (client) => {
    return new Promise(async (resolve, reject) => {
        const gameChannel = await client.channels.fetch(configuration.DISCORD.ID_MAP.CHANNELS.COUNT_UP_GAME)
        const achievementChannel = await client.channels.fetch(
            configuration.DISCORD.ID_MAP.CHANNELS.COUNT_UP_ACHIEVEMENTS
        )

        if (!gameChannel || !achievementChannel) {
            return reject(new Error('Missing required DISCORD content'))
        }

        const handleGameMessage = ({ message }) => {
            let { content, channel, member } = message
            let sentInteger = parseInt(content)

            if (currentNumber === 0 && sentInteger !== 1 && !isNaN(sentInteger)) {
                sendCountingStartsAtOne(channel, message)
            }

            if (!message.member.hasPermission('ADMINISTRATOR') && isNaN(sentInteger)) {
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

            if (sentInteger > cache.highestAchievedInteger) {
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

        specialMessages.on('countingGameMessage', handleGameMessage)

        ValueReturner.on('returnedValue', (value) => {
            saveValue(value)
            userBuffer = []
        })

        resolve()
    })
}

module.exports = {
    current: () => currentNumber,
    cachedInteger: () => cache.lastSavedInteger,
    highestAchievedInteger: () => cache.highestAchievedInteger,
    initializeGame: execute,
    parseCountingGameMessageEdit: handleMessageEdit,
    parseCountingGameMessageDelete: handleMessageDelete
}
