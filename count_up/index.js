const Discord = require('discord.js');
const fs = require("fs");

if (!fs.existsSync("./count_up/data.json")) {
    fs.writeFileSync("./count_up/data.json", '{"lastSavedInteger": 0}');
}

let cachedInteger = JSON.parse(
    fs.readFileSync("./count_up/data.json", "utf8")
).lastSavedInteger;

let configuration = require('../configuration.json')
let countingChannel = configuration.DISCORD.ID_MAP.CHANNELS.COUNT_UP_GAME
let achievementChannel = configuration.DISCORD.ID_MAP.CHANNELS.COUNT_UP_ACHIEVEMENTS

let { specialMessages } = require('../message_handling/handler.js')

let currentInteger = 0;
if (cachedInteger) {
    currentInteger = cachedInteger
}


let previousUsers = [];

let userBuffer = 2;


/* Valitsee ensimmäisen sopivan ylhäältä alas*/
let achievements = [
    [(current) => current === 69, (current, message) => 'Nice, ' + "<@" + message.author.id + ">" + ''],
    [(current) => current === 300, (current, message) => "<@" + message.author.id + "> saavutti luvun " + current],
    [(current) => current === 420, (current, message) => '420 korvenna sitä ' + "<@" + message.author.id + ">"],
    [(current) => current === 6969, (current, message) => "Ultra nice <@" + message.author.id + "> 6969"],
    [(current) => current === 7500, (current, message) => "<@" + message.author.id + "> saavutti luvun " + current],
    [(current) => current % 500 === 0 && current <= 3000, (current, message) => "<@" + message.author.id + ">" + ' saavutti luvun ' + current],
    [(current) => current % 1000 === 0 && current > 3000 && current <= 6000, (current, message) => "<@" + message.author.id + ">" + ' saavutti luvun ' + current],
    [(current) => current % 2500 === 0 && current > 6000, (current, message) => "<@" + message.author.id + ">" + ' saavutti luvun ' + current],
]

function notifyFromAchievement(achievementMessage, destination) {
    destination.send(achievementMessage)
}

function checkAchievements(currentInteger) {
    if (currentInteger < 1) return undefined;
    return achievements.find((achievementItem) => achievementItem[0](currentInteger))
}

specialMessages.on('countingGameMessage', ({ message, client }) => {
    let embed = new Discord.MessageEmbed().setColor(0xF4E542);

    const guild = client.guilds.cache.get(configuration.DISCORD.ID_MAP.GUILD)

    function backToStart(member, customMessage) {
        embed.setTitle("Takas nollaan että läsähti!").setDescription('<@' + member.id + '> teki jotain hirveää');
        if (customMessage) {
            embed.addField('huomio huomio', customMessage)
        }
        channel.send(embed)
        currentInteger = 0;
        previousUsers = []
    }

    let content = message.content
    let channel = message.channel
    let member = message.member
    let sentInteger = parseInt(content)

    if (currentInteger === 0 && sentInteger !== 1 && !isNaN(sentInteger)) {
        embed.setTitle('huomioikaa dumbot: se laskeminen alkaa ykkösestä')
        message.delete({ timeout: 7000 })
        channel.send(embed).then(message => message.delete({ timeout: 8000 })).catch(err => console.log(err))
    }

    if (!message.member.hasPermission('ADMINISTRATOR') && isNaN(sentInteger)) {
        message.delete()
        backToStart(member, 'pelkkiä lukuja chattiin')
    } else if (previousUsers.indexOf(member.id) !== -1 && currentInteger !== 0) {
        backToStart(member, 'anna vähintään ' + userBuffer + ' pelaajan nostaa lukua ensin')
    } else if (sentInteger !== currentInteger + 1 && currentInteger !== 0) {
        backToStart(member)
    } else if (sentInteger === currentInteger + 1 && previousUsers.indexOf(member.id) === -1) {
        currentInteger++;
        previousUsers.unshift(member.id)
    }

    let achievement = checkAchievements(currentInteger, message);

    if (achievement) {
        let destination = guild.channels.cache.get(achievementChannel)
        let congratulationsMessage = achievement[1](currentInteger, message)
        message.react('🎉')
        notifyFromAchievement(congratulationsMessage, destination)
    }

    while (previousUsers.length > userBuffer) {
        previousUsers.pop()
    }

    if (cachedInteger !== currentInteger) {
        cachedInteger = currentInteger
        fs.writeFile(
            "./count_up/data.json",
            JSON.stringify({ lastSavedInteger: cachedInteger }),
            function (err) {
                if (err) {
                    return console.info(err);
                }
            }
        );
    }
});

module.exports = {
    current: () => currentInteger,
    cachedInteger: () => cachedInteger
}