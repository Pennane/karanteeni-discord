process.chdir(__dirname)

let startingDate = Date.now()

const schedule = require('node-schedule')
const Discord = require('discord.js')
const chalk = require('chalk')
const axios = require('axios').default;

const configuration = require('./configuration.json')
const authorize = require('./authorize.json')

const client = new Discord.Client()

let cachedServerStatus = null;
let cachedMemberCount = null;

function parseReaction(reaction) {
    if (reaction.reaction.message.id === configuration.ID_MAP.MESSAGES.RULE_REACTION_MESSAGE) {
        if (reaction.reaction._emoji.name === "✅" && reaction.type === "ADD") {
            toggleRole(reaction.user, "Pelaaja", reaction.type)
        }
        if (reaction.reaction._emoji.name === "❗") {
            toggleRole(reaction.user, "Ilmoitukset", reaction.type)
        }
    }
}

function toggleRole(user, roleName, type) {
    let guild = client.guilds.cache.get(configuration.ID_MAP.GUILD)
    if (!guild) throw new Error("Client has an invalid main guild id")

    let role = guild.roles.cache.find(role => role.name === roleName)
    if (!role) throw new Error("Main guild does not have a role named '" + roleName + "'")

    let member = guild.members.cache.get(user.id)
    if (!member) throw new Error("Guild does not have received user as a member")

    if (type === "ADD") {
        member.roles.add(role);
    } else if (type === "REMOVE") {
        member.roles.remove(role);
    }

}

function cacheRequiredMessages() {
    return new Promise((resolve, reject) => {
        let rulesTextChannel = client.channels.cache.get(configuration.ID_MAP.CHANNELS.CHANNEL_RULES)
        rulesTextChannel.messages.fetch(configuration.ID_MAP.MESSAGES.ruleRoleMessage)
            .then(() => {
                console.log('cached required messages')
                resolve()
            })
            .catch(error => {
                console.log('failed to cache required messages')
            })
    })

}

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

function updateServerStatus() {
    return new Promise(async (resolve, reject) => {
        let guild = client.guilds.cache.get(configuration.ID_MAP.GUILD)
        let onServer = guild.channels.cache.get(configuration.ID_MAP.CHANNELS.CURRENT_PLAYERS_ON_SERVER);
        let onDiscord = guild.channels.cache.get(configuration.ID_MAP.CHANNELS.ALL_PLAYERS_ON_DISCORD);

        let serverStatus = await fetchServerStatus();
        if (!cachedServerStatus || serverStatus.players.online !== cachedServerStatus.players.online) {
            onServer.setName("Pelaajia servulla: " + serverStatus.players.online);
        }

        if (!cachedMemberCount || guild.memberCount !== cachedMemberCount) {
            onDiscord.setName("Pelaajia discordissa: " + guild.memberCount);
        }

        cachedServerStatus = serverStatus;
        cachedMemberCount = guild.memberCount;

        resolve(true)
    })
}

function updateAutomatedRoles() {
    return new Promise(async (resolve, reject) => {
        let guild = client.guilds.cache.get(configuration.ID_MAP.GUILD)
        if (!guild) throw new Error("Client has an invalid main guild id")

        let channel = guild.channels.cache.get(configuration.ID_MAP.CHANNELS.CHANNEL_RULES)
        if (!channel) throw new Error("Main guild does not have given channel as a part of it")

        let message = channel.messages.cache.get(configuration.ID_MAP.MESSAGES.RULE_REACTION_MESSAGE)
        if (!message) throw new Error("Did not find the role reaction message")


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

        resolve(true)
    })
}



client.on('ready', async () => {

    // Cache messages required for updating roles
    await cacheRequiredMessages()

    // Update server status and add missing roles
    await updateServerStatus()
    await updateAutomatedRoles()


    // Update the info channel names in discord every 10 minutes
    let serverStatusScheduler = schedule.scheduleJob('*/10 * * * *', () => {
        updateServerStatus()
    });

    // Check that the bot has given necessary roles every hour
    let rolesUptodateScheduler = schedule.scheduleJob('* */1 * * *', () => {
        updateAutomatedRoles()
    });

    console.log(chalk.blue("//// Botti virallisesti hereillä."))
    console.log(chalk.blue("//// Käynnistyminen kesti"), chalk.red(Date.now() - startingDate), chalk.blue('ms'))
    console.log(chalk.blue("//// Discord serverillä yhteensä", chalk.yellow(cachedMemberCount), chalk.blue('pelaajaa')))
    console.log(chalk.blue("//// Minecraftissa tällä hetkellä", chalk.yellow(cachedServerStatus.players.online), chalk.blue('pelaajaa')))
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