process.chdir(__dirname)

const { Client, Intents } = require("discord.js");
const configuration = require('./configuration.json')
const authorize = require('./authorize.json')

const intents = new Intents([
    Intents.NON_PRIVILEGED, // include all non-privileged intents, would be better to specify which ones you actually need
    "GUILD_MEMBERS", // lets you request guild members (i.e. fixes the issue)
]);

const client = new Client({ ws: { intents } });

function addRole(member, role) {
    if (!member || !role) throw new Error('Missing arguments')
    if (!member.roles.cache.find(role => role.name === "Pelaaja")) {
        member.roles.add(role)
        return console.log(member.user.username + ' received the role.')
    }
}


client.on('ready', async () => {
    const guild = await client.guilds.fetch(configuration.DISCORD.ID_MAP.GUILD)
    const role = guild.roles.cache.find(role => role.name === "Pelaaja")

    console.log(guild.memberCount, guild.members.cache.size)
    console.log("Starting to fetch the guild members. This might take a while....")
    guild.members.fetch()
        .then(members => {
            console.log('Fetched members. Amount of fetched members: ', [...members.values()].length)
            members.forEach(member => {
                addRole(member, role)
            })
        })
        .catch(console.error);
})

client.login(authorize.discord.token)
