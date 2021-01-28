const Discord = require('discord.js')

function notifyRole(notifyRequest) {
    let { streamChange, notifyRole, destination } = notifyRequest

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
        .setTitle(streamChange.title, streamUrl)
        .setImage(thumbnailUrl)
        .setURL(streamUrl)
        .setTimestamp()
        .setThumbnail(streamChange.profilePicture)
        .setFooter('Stream ilmoitus', 'https://i.imgur.com/WWmTu7c.png')

    if (streamChange.game) {
        embed.addField(`Peli`, streamChange.game.name, true)
    }

    let message = new Discord.APIMessage(destination, {
        content: `[ <@&${notifyRole.id}> ]`,
        embed: embed
    })

    destination.send(message)
}

module.exports = {
    notify: notifyRole
}
