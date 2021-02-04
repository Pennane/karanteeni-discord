import Discord from 'discord.js'
import configuration from './config'

export const toggleRole = (member: Discord.GuildMember, roleName: string, type: 'ADD' | 'REMOVE'): void => {
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

export const memberHasRole = (member: Discord.GuildMember, roleName: string): boolean => {
    return member.roles.cache.some((role) => role.name === roleName)
}
