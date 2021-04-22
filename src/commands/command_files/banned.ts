import Command, { CommandExecutor } from '../Command'

import { currentlyBannedUsers } from '../../moderation/index'

const configuration = {
    name: 'allbanned',
    admin: true,
    syntax: 'allbanned ',
    desc: 'Kaikki jotka on bännitty ukkeli',
    triggers: ['allbanned'],
    type: ['työkalut'],
    requireGuild: false
}

const executor: CommandExecutor = (message, client, args) => {
    return new Promise(async (resolve, reject) => {
        if (!client) return

        let users = await currentlyBannedUsers()

        if (!users || users.length === 0) {
            message.channel.send(`No one is banned.`)
            return
        }

        let text = users.reduce((t, c) => {
            if (!c.currentBan) return t

            return t.concat(`<@!${c.id}> ${c.currentBan?.duration === 'permanent' ? 'permanent' : `temp`}
             `)
        }, '')
        message.channel.send(text)
    })
}

export default new Command({
    configuration,
    executor
})
