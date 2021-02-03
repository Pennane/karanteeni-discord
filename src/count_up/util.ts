import achievements from './achievements'
import Discord from 'discord.js'

export const pushHighestAchievedNumber = (value: number, destination: Discord.TextChannel) => {
    destination
        .edit({
            topic: `Huikeat #laskuri saavutukset. Korkein saavutettu numero on ${String(value)}`
        })
        .catch(console.error)
}
export const notifyFromAchievement = async (achievementMessage: string, destination: Discord.TextChannel) => {
    destination.send(achievementMessage)
}

export const findAchievement = (int: number) => {
    if (int < 1) return undefined
    return achievements.find((achievement) => {
        return achievement[0](int)
    })
}

export const findAndGiveAchievements = async (
    int: number,
    message: Discord.Message,
    destination: Discord.TextChannel
) => {
    let achievement = findAchievement(int)
    if (achievement) {
        let achievementFunction = achievement[1]
        let congratulationsMessage = achievementFunction(int, message)
        message.react('🎉')
        notifyFromAchievement(congratulationsMessage, destination)
    }
}
export const sendResetMessage = (
    destination: Discord.TextChannel,
    member: Discord.GuildMember,
    customMessage?: string | null
) => {
    let embed = new Discord.MessageEmbed()
        .setColor(0xf4e542)
        .setTitle('Takas nollaan että läsähti!')
        .setDescription(`<@${member.user.id}> teki jotain hirveää`)
    if (customMessage) {
        embed.addField('huomio huomio', customMessage)
    }

    destination.send(embed)
}
export const sendCountingStartsAtOne = (destination: Discord.TextChannel, oldMessage: Discord.Message) => {
    let embed = new Discord.MessageEmbed().setColor(0xf4e542)
    embed.setTitle('huomioikaa dumbot: se laskeminen alkaa ykkösestä')
    oldMessage.delete({ timeout: 7000 })
    destination
        .send(embed)
        .then((message) => message.delete({ timeout: 8000 }))
        .catch((err) => console.info(err))
}
