process.chdir(__dirname)

import Discord, { Client, Intents } from 'discord.js'
import configuration from './util/config'

const intents = new Intents([
    Intents.NON_PRIVILEGED, // include all non-privileged intents, would be better to specify which ones you actually need
    'GUILD_MEMBERS' // lets you request guild members (i.e. fixes the issue)
])

const client = new Client({ ws: { intents } })

const addRole = (member: Discord.GuildMember, role: Discord.Role) => {
    if (!member || !role) throw new Error('Missing arguments')
    if (!member.roles.cache.find((role) => role.name === 'Pelaaja')) {
        member.roles.add(role)
        return console.info(member.user.username + ' received the role.')
    }
}

client.on('ready', async () => {
    const guild = await client.guilds.fetch(configuration.DISCORD.ID_MAP.GUILD)
    const role = guild.roles.cache.find((role) => role.name === 'Pelaaja')
    if (!role) throw new Error('Did not have wanted role')
    console.info(guild.memberCount, guild.members.cache.size)
    console.info('Starting to fetch the guild members. This might take a while....')
    let members = await guild.members.fetch()
    console.info('Fetched members. Amount of fetched members: ', [...members.values()].length)
    members.forEach((member) => {
        addRole(member, role)
    })
})

client.login(configuration.DISCORD.TOKEN)
