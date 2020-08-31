const axios = require('axios').default;

const configuration = require('../configuration.json')

let serverStatusUrl = 'https://api.mcsrvstat.us/2/mc.karanteeni.net'

let cachedMinecraftServerStatus = null;
let cachedMemberCount = null;

function fetchMinecraftServerStatus() {
    return new Promise((resolve, reject) => {
        axios.get(serverStatusUrl)
            .then(function (response) {
                resolve(response.data)
            })
            .catch(function (error) {
                reject(error)
            });
    });
}

function updateServerStatus(guild) {
    return new Promise(async (resolve, reject) => {
        if (!guild || !guild.available) return console.log('Main guild is not available.')

        let minecraftplayersUpdateChannel = guild.channels.cache.get(configuration.DISCORD.ID_MAP.CHANNELS.CURRENT_PLAYERS_ON_MINECRAFT_SERVER);
        let discordusersUpdateChannel = guild.channels.cache.get(configuration.DISCORD.ID_MAP.CHANNELS.ALL_PLAYERS_ON_DISCORD);

        let serverStatus = await fetchMinecraftServerStatus();

        if (!minecraftplayersUpdateChannel.editable || !discordusersUpdateChannel.editable) {
            return console.log("Unable to edit required channels. Aborting.")
        }

        if (serverStatus && serverStatus.online === true && (!cachedMinecraftServerStatus || serverStatus.players.online !== cachedMinecraftServerStatus.players.online)) {

            minecraftplayersUpdateChannel.edit({
                name: "Pelaajia servulla: " + serverStatus.players.online
            })
                .catch(err => console.log(err))

        } else if (serverStatus && serverStatus.online === false && (!cachedMinecraftServerStatus || cachedMinecraftServerStatus.online !== false)) {

            minecraftplayersUpdateChannel.edit({
                name: "Palvelin poissa päältä"
            })
                .catch(err => console.log(err))

        } else if (!serverStatus && cachedMinecraftServerStatus) {

            minecraftplayersUpdateChannel.edit({
                name: "Pelaajia servulla: ?"
            })
                .catch(err => console.log(err))

        }


        if (!cachedMemberCount || guild.memberCount !== cachedMemberCount) {

            discordusersUpdateChannel.edit({
                name: "Pelaajia discordissa: " + guild.memberCount
            })
                .catch(err => console.log(err))

        }

        cachedMinecraftServerStatus = serverStatus;
        cachedMemberCount = guild.memberCount;

        resolve()
    })
}

module.exports = {
    update: updateServerStatus,
    cached: () => cachedMinecraftServerStatus
}