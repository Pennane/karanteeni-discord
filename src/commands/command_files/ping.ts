import Command, { CommandExecutor } from '../Command'

const configuration = {
    name: 'ping',
    admin: true,
    syntax: 'ping',
    desc: 'pingaa bottia',
    triggers: ['ping', 'pong'],
    type: ['työkalut'],
    requireGuild: false
}

const executor: CommandExecutor = (message, client, args) => {
    return new Promise(async (resolve, reject) => {
        let embed = Command.createEmbed()
        embed.setTitle('Pong!').setDescription(Date.now() - message.createdTimestamp + 'ms')
        message.channel.send(embed)
        resolve()
    })
}

export default new Command({
    configuration,
    executor
})
