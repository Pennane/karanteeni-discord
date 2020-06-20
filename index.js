process.chdir(__dirname)

const schedule = require('node-schedule')
const Discord = require('discord.js')
const chalk = require('chalk')
const axios = require('axios').default;

const authorize = require('./authorize.json')

const client = new Discord.Client()

const guildId = "723550799254519808"

const channelIds = {
    onServer: '723557810654150736',
    onDiscord: '723556322808692786',
    rules: '723560367292416081'
}

const messageIds = {
    ruleRoleMessage: "723578423456432189"
}

let cachedServerStatus = null;
let cachedMemberCount = null;

function fetchServerStatus() {
    return new Promise((resolve, reject) => {
        axios.get('https://api.mcsrvstat.us/2/mc.karanteeni.net')
            .then(function (response) {
                resolve(response.data)
            })
            .catch(function (error) {
                reject(error)
            });
    });
}


async function updateServerStatus() {
    let guild = client.guilds.cache.get(guildId)
    let onServer = guild.channels.cache.get(channelIds.onServer);
    let onDiscord = guild.channels.cache.get(channelIds.onDiscord);

    let serverStatus = await fetchServerStatus();
    if (!cachedServerStatus || serverStatus.players.online !== cachedServerStatus.players.online) {
        onServer.setName("Pelaajia servulla: " + serverStatus.players.online);
    }

    if (!cachedMemberCount || guild.memberCount !== cachedMemberCount) {
        onDiscord.setName("Pelaajia discordissa: " + guild.memberCount);
    }

    cachedServerStatus = serverStatus;
}

async function updateGivenRoles() {
    let guild = client.guilds.cache.get(guildId)
    let channel = guild.channels.cache.get(channelIds.rules)
    let message = channel.messages.cache.get(messageIds.ruleRoleMessage)
    let playerRoles = await message.reactions.cache.get("✅").users.fetch()
    let notifyRoles = await message.reactions.cache.get("❗").users.fetch()

    playerRoles.each(player => {
        let member = guild.members.cache.get(player.id)
        if (!member) return;
        let roleName = "Pelaaja"
        let role = guild.roles.cache.find(role => role.name === roleName)
        if (member.roles.cache.find(role => role.name === roleName)) return;
        member.roles.add(role);
    })

    notifyRoles.each(player => {
        let member = guild.members.cache.get(player.id)
        if (!member) return;
        let roleName = "Ilmoitukset"
        let role = guild.roles.cache.find(role => role.name === roleName)
        if (member.roles.cache.find(role => role.name === roleName)) return;
        member.roles.add(role);
    })
}

function toggleRole(user, roleName, type) {
    let guild = client.guilds.cache.get(guildId)
    if (!guild) throw new Error("no guild bro")
    let role = guild.roles.cache.find(role => role.name === roleName)

    let member = guild.members.cache.get(user.id)
    if (type === "ADD") {
        member.roles.add(role);
    } else if (type === "REMOVE") {
        member.roles.remove(role);
    }

}

function parseReaction(reaction) {
    if (reaction.reaction.message.id === messageIds.ruleRoleMessage) {
        if (reaction.reaction._emoji.name === "✅" && reaction.type === "ADD") {
            toggleRole(reaction.user, "Pelaaja", reaction.type)
        }
        if (reaction.reaction._emoji.name === "❗") {
            toggleRole(reaction.user, "Ilmoitukset", reaction.type)
        }
    }
}

function cacheRequiredMessages() {
    return new Promise((resolve, reject) => {
        let rulesTextChannel = client.channels.cache.get(channelIds.rules)
        rulesTextChannel.messages.fetch(messageIds.ruleRoleMessage)
            .then(() => {
                console.log('cached required messages')
                resolve()
            })
            .catch(error => {
                console.log('failed to cache required messages')
            })
    })

}

client.on('ready', async () => {
    await cacheRequiredMessages()
    updateServerStatus()
    updateGivenRoles()


    let serverStatusScheduler = schedule.scheduleJob('*/1 * * * *', () => {
        updateServerStatus()
    });

    let rolesUptodateScheduler = schedule.scheduleJob('* */1 * * *', () => {
        updateGivenRoles()
    });

    console.log(chalk.blue("//// Botti virallisesti hereillä."))
})

client.on("messageReactionAdd", (reaction, user) => {
    parseReaction({
        reaction: reaction,
        user: user,
        type: "ADD"
    })
})

client.on("messageReactionRemove", (reaction, user) => {
    parseReaction({
        reaction: reaction,
        user: user,
        type: "REMOVE"
    })
})


client.login(authorize.token)