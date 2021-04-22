import Discord from 'discord.js'
import { CommandConfiguration } from './Command'
import configuration from '../util/config'
const prefix = configuration.PREFIX

export interface SyntaxEmbedOptions {
    configuration: CommandConfiguration
    heading?: string | null
    body?: string | null
}
const syntaxEmbed: (options: SyntaxEmbedOptions) => Discord.MessageEmbed = ({ configuration, heading, body }) => {
    const embed = new Discord.MessageEmbed()
    embed.setColor('#FF0000')

    if (!configuration) throw new Error('No configuration to search syntax for.')
    if (!configuration.syntax) throw new Error('configuration did not include command syntax.')
    if (!configuration.name) throw new Error('configuration did not include a name for the commmand.')

    embed.title = heading || `Komento ${configuration.name} toimii näin:`
    embed.description = body || `\`${prefix}${configuration.syntax}\``

    if (configuration.triggers.length > 1) {
        embed.addField(
            `Vaihtoehtoiset nimet komennolle`,
            configuration.triggers.map((trigger) => prefix.concat(trigger)).join(' ')
        )
    }

    return embed
}

export default syntaxEmbed
