const achievements = require('./achievements')
import Discord from 'discord.js'

export const pushHighestAchievedNumber = (value, destination) => {
    destination.edit({
        topic: 'Huikeat #laskuri saavutukset. Korkein saavutettu numero on ' + value
    })
}
export const notifyFromAchievement = async (achievementMessage, destination) => {
    destination.send(achievementMessage)
}

export const findAchievement = (int) => {
    if (int < 1) return undefined
    return achievements.find((achievement) => {
        return achievement[0](int)
    })
}

export const findAndGiveAchievements = async (int, message, destination) => {
    let achievement = findAchievement(int)
    if (achievement) {
        let achievementFunction = achievement[1]
        let congratulationsMessage = achievementFunction(int, message)
        message.react('🎉')
        notifyFromAchievement(congratulationsMessage, destination)
    }
}
export const sendResetMessage = (destination, member, customMessage) => {
    let embed = new Discord.MessageEmbed()
        .setColor(0xf4e542)
        .setTitle('Takas nollaan että läsähti!')
        .setDescription(`<@${member.user.id}> teki jotain hirveää`)
    if (customMessage) {
        embed.addField('huomio huomio', customMessage)
    }

    destination.send(embed)
}
export const sendCountingStartsAtOne = (destination, oldMessage) => {
    let embed = new Discord.MessageEmbed().setColor(0xf4e542)
    embed.setTitle('huomioikaa dumbot: se laskeminen alkaa ykkösestä')
    oldMessage.delete({ timeout: 7000 })
    destination
        .send(embed)
        .then((message) => message.delete({ timeout: 8000 }))
        .catch((err) => console.info(err))
}
