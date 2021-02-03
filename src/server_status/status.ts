import axios from 'axios'
import Discord from 'discord.js'

import configuration from '../util/config'

let serverStatusUrl = 'https://api.mcsrvstat.us/2/mc.karanteeni.net'

let cachedServerStatus: any | null = null
let cachedMemberCount: number | null = null

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

function update(guild: Discord.Guild): Promise<void> {
    return new Promise(
        async (resolve, reject): Promise<void> => {
            if (!guild || !guild.available) return console.info('Main guild is not available.')

            let minecraftplayersUpdateChannel = guild.channels.cache.get(
                configuration.DISCORD.ID_MAP.CHANNELS.CURRENT_PLAYERS_ON_MINECRAFT_SERVER
            ) as Discord.VoiceChannel
            let discordusersUpdateChannel = guild.channels.cache.get(
                configuration.DISCORD.ID_MAP.CHANNELS.ALL_PLAYERS_ON_DISCORD
            ) as Discord.VoiceChannel

            if (!minecraftplayersUpdateChannel || !discordusersUpdateChannel) throw new Error('Missing channel')

            let serverStatus: any = await fetchMinecraftServerStatus()

            if (!minecraftplayersUpdateChannel.editable || !discordusersUpdateChannel.editable) {
                return console.info('Unable to edit required channels. Aborting.')
            }

            if (!cachedMemberCount || guild.memberCount !== cachedMemberCount) {
                discordusersUpdateChannel
                    .edit({
                        name: 'Pelaajia discordissa: ' + guild.memberCount
                    })
                    .catch((err: any) => console.info(err))
            }

            let statusHasPlayercount = serverStatus?.players?.online
            let cachedStatusHasPlayercount = cachedServerStatus?.players?.online

            if (!serverStatus) {
                // API down
                minecraftplayersUpdateChannel
                    .edit({
                        name: 'Pelaajia servulla: ?'
                    })
                    .catch((err: any) => console.info(err))
            } else if (statusHasPlayercount) {
                if (!cachedStatusHasPlayercount || serverStatus.players.online !== cachedServerStatus.players.online) {
                    minecraftplayersUpdateChannel
                        .edit({
                            name: 'Pelaajia servulla: ' + serverStatus.players.online
                        })
                        .catch((err: any) => console.info(err))
                }
            } else if (serverStatus.online === false) {
                if (!cachedServerStatus || cachedServerStatus.online !== false) {
                    minecraftplayersUpdateChannel
                        .edit({
                            name: 'Palvelin poissa päältä'
                        })
                        .catch((err: any) => console.info(err))
                }
            }

            cachedServerStatus = serverStatus
            cachedMemberCount = guild.memberCount

            resolve()
        }
    )
}

const status = {
    update: update,
    cached: () => cachedServerStatus
}

export default status
