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
        const importedGame = await import('../../count_up/index')
        const CountUpGame = importedGame.default
        const value = CountUpGame.current()
        const embed = Command.createEmbed()
        embed.setTitle('Laskurin arvo').setDescription('Laskurissa tällä hetkelleä arvo: ' + value)
        message.channel.send(embed)
        resolve()
    })
}

export default new Command({
    configuration,
    executor
})
