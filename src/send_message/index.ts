import Discord from 'discord.js'
import configuration from '../util/config'

let client: Discord.Client | null

const getDefaultGuild = async (): Promise<Discord.Guild> => {
    if (!client) throw new Error('send_message has not been initialized properly. client is missing')
    return await client.guilds.fetch(configuration.DISCORD.ID_MAP.GUILD)
}

const getChannel = async (id: string): Promise<Discord.Channel> => {
    if (!client) throw new Error('send_message has not been initialized properly. client is missing')
    return await client.channels.fetch(id)
}

const getUser = async (id: string): Promise<Discord.User> => {
    if (!client) throw new Error('send_message has not been initialized properly. client is missing')
    return await client.users.fetch(id)
}

export const sendMessageToUser = async (userId: string, message: string | Discord.MessageEmbed) => {
    const user = await getUser(userId)
    if (!user) return
    user.send(message)
}

export const sendMessageToChannel = async (channelId: string, message: string | Discord.MessageEmbed) => {
    const channel = (await getChannel(channelId)) as Discord.TextChannel
    if (!channel) return
    channel.send(message)
}

export const init = (_client: Discord.Client): void => {
    client = _client
}
