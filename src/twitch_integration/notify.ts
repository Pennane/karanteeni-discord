import Discord from 'discord.js'

interface StreamChange {
    type: string
    user: string
    title: string
    thumbnail: string
    profilePicture: string
    game: any
}

interface NotifyRequest {
    streamChange: StreamChange
    role: Discord.Role
    destination: Discord.Channel
}
const notifyRole = (notifyRequest: NotifyRequest) => {
    let { streamChange, role, destination } = notifyRequest
    console.info(streamChange)

    let embed = new Discord.MessageEmbed()
    let thumbnailUrl = streamChange.thumbnail
    let streamUrl = `https://www.twitch.tv/${streamChange.user}`

    if (thumbnailUrl) {
        thumbnailUrl = thumbnailUrl.replace('{width}', '1920')
        thumbnailUrl = thumbnailUrl.replace('{height}', '1080')
    }

    embed
        .setAuthor(streamChange.user, streamChange.profilePicture)
        .setColor('#fdf500')
        .setTitle(streamChange.title)
        .setImage(thumbnailUrl)
        .setURL(streamUrl)
        .setTimestamp()
        .setThumbnail(streamChange.profilePicture)
        .setFooter('Stream ilmoitus', 'https://i.imgur.com/WWmTu7c.png')

    if (streamChange.game && streamChange.game.name) {
        embed.addField(`Peli`, streamChange.game.name, true)
    }

    ;(destination as Discord.TextChannel).send(null, {
        content: `[ <@&${role.id}> ]`,
        embed: embed
    })
}

export default notifyRole
