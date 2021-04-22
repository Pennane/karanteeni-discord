import Discord from 'discord.js'
import configuration from '../util/config'
import { unban } from './functionality'
import cron from 'node-schedule'
import { User } from './types'
import { sendMessageToChannel, sendMessageToUser } from '../send_message/index'

export const parseDuration = (durationString: string | null): number | null => {
    if (!durationString) return null
    let msInDay = 86400000
    let msInHour = 3600000
    let duration = parseInt(durationString.substring(0, durationString.length - 1))
    let type = durationString.charAt(durationString.length - 1)
    switch (type) {
        case 'y':
            return duration * 365 * msInDay
        case 'm':
            return duration * 30 * msInDay
        case 'd':
            return duration * msInDay
        case 'h':
            return duration * msInHour
        case 's':
            return duration * 1000
        default:
            return null
    }
}

export const discordBan = async (id: string, reason: string, client: Discord.Client) => {
    const guild = await client.guilds.fetch(configuration.DISCORD.ID_MAP.GUILD)
    guild.members.ban(id, {
        reason
    })
}

export const discordUnban = async (id: string, client: Discord.Client) => {
    const guild = await client.guilds.fetch(configuration.DISCORD.ID_MAP.GUILD)
    guild.members.unban(id)
}

export const discordKick = async (id: string, reason: string, client: Discord.Client) => {
    const guild = await client.guilds.fetch(configuration.DISCORD.ID_MAP.GUILD)
    const member = await guild.members.fetch(id)
    if (!member) return
    member.kick(reason)
}

export const informUser = async (id: string, title: string, message: string) => {
    let embed = new Discord.MessageEmbed().setColor(0xf4e542)
    embed.setTitle('Karanteeni Moderaattori Ilmoittaa')
    embed.addField(title, message)
    embed.setFooter('ÄLÄ VASTAA TÄHÄN VIESTIIN. VASTAUKSIA EI HUOMATA')
    sendMessageToUser(id, embed)
}

export const informInActionLog = async (message: string) => {
    let embed = new Discord.MessageEmbed().setColor(0xf4e542)
    embed.setTitle('Karanteeni Moderaattori Ilmoittaa')
    embed.addField('Huom', message)
    sendMessageToChannel(configuration.DISCORD.ID_MAP.CHANNELS.ACTION_LOG, embed)
}

export const listenForUnban = async (user: User) => {
    let ban = user.currentBan
    if (ban && ban.duration !== 'permanent') {
        cron.scheduleJob(ban.date + ban.duration, async () => {
            unban(user.id)
            console.log('unbanned ' + user.id)
            informInActionLog(`<@${user.id}> bannit ovat loppuneet`)
        })
    }
}
