import Command, { CommandExecutor } from '../Command'

import serverStatus from '../../server_status/status'

let minecraftChatId = '613071441268834304'

const configuration = {
    name: 'list',
    admin: false,
    syntax: 'list',
    desc: 'hakee pelaajat palvelimelta',
    triggers: ['list', 'lista'],
    type: ['työkalut'],
    requireGuild: true
}

const executor: CommandExecutor = (message, client, args) => {
    return new Promise(async (resolve, reject) => {
        if (message.channel.id !== minecraftChatId) {
            return
        }
        let embed = Command.createEmbed()
        let cachedStatus = serverStatus.cached()
        if (!cachedStatus || !cachedStatus.players || !cachedStatus.players.list) {
            message.channel.send('Ei onnannut hakea severin pelaajia')
        } else {
            let players = cachedStatus.players.list.join(', ')
            embed.addField('Palvelimella viimeksi nähty seuraavat pelaajat:', players)
            message.channel.send(embed)
        }
        resolve()
    })
}

export default new Command({
    configuration,
    executor
})
