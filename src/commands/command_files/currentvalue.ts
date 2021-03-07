import Command, { CommandExecutor } from '../Command'

const configuration = {
    name: 'hae',
    admin: true,
    syntax: 'hae',
    desc: 'hae numeropeliin arvo',
    triggers: ['haearvo'],
    type: ['työkalut'],
    requireGuild: false
}

const executor: CommandExecutor = (message, client, args) => {
    return new Promise(async (resolve, reject) => {
        const CountUpGame = (await import('../../count_up/index')).default
        const value = CountUpGame.current()
        const embed = Command.createEmbed()
        embed.setTitle('Laskurin arvo').setDescription('Laskurissa on tällä hetkellä arvo: ' + value)
        message.channel.send(embed)
        resolve()
    })
}

export default new Command({
    configuration,
    executor
})
