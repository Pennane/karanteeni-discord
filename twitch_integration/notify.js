const Discord = require('discord.js')

function notifyRole(notifyRequest) {
    let {streamChange, notifyRole, destination} = notifyRequest;

    let embed = new Discord.MessageEmbed()
    let thumbnailUrl = streamChange.thumbnail;
    let streamUrl = `https://www.twitch.tv/${streamChange.user}`;

    if (thumbnailUrl) {
        thumbnailUrl = thumbnailUrl.replace('{width}', "1920")
        thumbnailUrl = thumbnailUrl.replace('{height}', "1080")
    }

    embed
        .setAuthor('Karanteenin Twitch Ilmoittaja')
        .setColor('#fdf500')
        .setTitle(streamChange.user + " on linjoilla! - Twitch")
        .setImage(thumbnailUrl)
        .setDescription(streamChange.user + ' - ' + streamChange.title)
        .setURL(streamUrl)
        .setTimestamp()
        .setThumbnail(streamChange.profilePicture)
        .setFooter('Twitch ilmoitus provided by karanteeni', 'https://i.imgur.com/WWmTu7c.png')
        .addField(`\u200b`, '[Tule seuraamaan Karanteenin ylläpidon streamia!](' + streamUrl + ')')

    let message = new Discord.APIMessage(channel, {
        content: `[ <@&${notifyRole.id}> ]`,
        embed: embed
    });

    destination.send(message)
}

module.exports = {
    notify: notifyRole
}