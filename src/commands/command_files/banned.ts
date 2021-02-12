import Command, { CommandExecutor } from '../Command'

import { currentlyBannedUsers } from '../../moderation/index'

const configuration = {
    name: 'banned',
    admin: true,
    syntax: 'banned ',
    desc: 'Unbanni ukkeli',
    triggers: ['allbanned'],
    type: ['työkalut'],
    requireGuild: false
}

const executor: CommandExecutor = (message, client, args) => {
    return new Promise(async (resolve, reject) => {
        if (!client) return

        let users = await currentlyBannedUsers()

        if (users) {
            let now = Date.now()
            let text = users.reduce((t, c) => {
                if (!c.currentBan) return t

                return t.concat(`<@!${c.id}> ${c.currentBan?.duration === 'permanent' ? 'permanent' : `temp`}
             `)
            }, '')
            message.channel.send(text)
        } else {
            message.channel.send(`Failed to get banned. Are there any ?`)
        }
    })
}

export default new Command({
    configuration,
    executor
})
