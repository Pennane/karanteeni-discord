const axios = require('axios').default

const configuration = require('../util/config')

let serverStatusUrl = 'https://api.mcsrvstat.us/2/mc.karanteeni.net'

let cachedServerStatus = null
let cachedMemberCount = null

function fetchMinecraftServerStatus() {
    return new Promise((resolve, reject) => {
        axios
            .get(serverStatusUrl)
            .then(function (response) {
                resolve(response.data)
            })
            .catch(function (error) {
                reject(error)
            })
    })
}

function updateServerStatus(guild) {
    return new Promise(async (resolve, reject) => {
        if (!guild || !guild.available) return console.log('Main guild is not available.')

        let minecraftplayersUpdateChannel = guild.channels.cache.get(
            configuration.DISCORD.ID_MAP.CHANNELS.CURRENT_PLAYERS_ON_MINECRAFT_SERVER
        )
        let discordusersUpdateChannel = guild.channels.cache.get(
            configuration.DISCORD.ID_MAP.CHANNELS.ALL_PLAYERS_ON_DISCORD
        )

        let serverStatus = await fetchMinecraftServerStatus()

        if (!minecraftplayersUpdateChannel.editable || !discordusersUpdateChannel.editable) {
            return console.log('Unable to edit required channels. Aborting.')
        }

        if (!cachedMemberCount || guild.memberCount !== cachedMemberCount) {
            discordusersUpdateChannel
                .edit({
                    name: 'Pelaajia discordissa: ' + guild.memberCount
                })
                .catch((err) => console.log(err))
        }

        let statusHasPlayercount = serverStatus && serverStatus.players && serverStatus.players.online
        let cachedStatusHasPlayercount =
            cachedServerStatus && cachedServerStatus.players && cachedServerStatus.players.online

        if (!serverStatus) {
            // API down
            minecraftplayersUpdateChannel
                .edit({
                    name: 'Pelaajia servulla: ?'
                })
                .catch((err) => console.log(err))
        } else if (statusHasPlayercount) {
            if (!cachedStatusHasPlayercount || serverStatus.players.online !== cachedServerStatus.players.online) {
                minecraftplayersUpdateChannel
                    .edit({
                        name: 'Pelaajia servulla: ' + serverStatus.players.online
                    })
                    .catch((err) => console.log(err))
            }
        } else if (serverStatus.online === false) {
            if (!cachedServerStatus || cachedServerStatus.online !== false) {
                minecraftplayersUpdateChannel
                    .edit({
                        name: 'Palvelin poissa päältä'
                    })
                    .catch((err) => console.log(err))
            }
        }

        cachedServerStatus = serverStatus
        cachedMemberCount = guild.memberCount

        resolve()
    })
}

module.exports = {
    update: updateServerStatus,
    cached: () => cachedServerStatus
}
