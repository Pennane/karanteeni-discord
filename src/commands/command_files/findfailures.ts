import Command, { CommandExecutor } from '../Command'
import config from '../../util/config'
import fs from 'fs'

const configuration = {
    name: 'mokat',
    admin: true,
    syntax: 'mokat <pelaaja_id>',
    desc: 'hae tallennettujen mokien määrä',
    triggers: ['mokat', 'haemokat'],
    type: ['työkalut'],
    requireGuild: false
}

const executor: CommandExecutor = (message, client, args) => {
    return new Promise(async (resolve, reject) => {
        let failLocation = config.COUNTING_GAME.FAILURE_LOCATION

        if (!fs.existsSync(failLocation)) return message.channel.send('ei ollenkaan tallennettuja mokia')

        if (args.length < 2) return message.channel.send('laita se pelaaja id siihe kans')

        const id = args[1]
        const embed = Command.createEmbed()
        const failData = JSON.parse(fs.readFileSync(failLocation, 'utf-8'))
        const playerFails = failData[id] || 0
        embed.setTitle('Tallennetut mokat').setDescription(`Pelaajalla <@${id}> ${playerFails} tallennettua mokaa`)
        message.channel.send(embed)
        return resolve()
    })
}

export default new Command({
    configuration,
    executor
})
