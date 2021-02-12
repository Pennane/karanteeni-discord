import { toggleRole } from '../util/discordutil'
import Discord from 'discord.js'
import configuration from '../util/config'

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

export const setBannedRank = async (id: string, state: boolean, client: Discord.Client): Promise<void> => {
    const guild = await client.guilds.fetch(configuration.DISCORD.ID_MAP.GUILD)
    const member = await guild.members.fetch(id)
    if (!member) return

    if (state) {
        toggleRole(member, 'Banned', 'ADD')
    } else {
        toggleRole(member, 'Banned', 'REMOVE')
        toggleRole(member, 'Pelaaja', 'ADD')
    }
}
